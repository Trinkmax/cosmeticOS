"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

const createSchema = z.object({
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  client_id: z.string().uuid().optional().nullable(),
  walk_in_name: z.string().optional().nullable(),
  service_ids: z.array(z.string().uuid()).default([]),
  professional_ids: z.array(z.string().uuid()).default([]),
  room_ids: z.array(z.string().uuid()).default([]),
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).default("confirmed"),
});

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

export async function createAppointmentAction(input: z.infer<typeof createSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (!parsed.data.client_id && !parsed.data.walk_in_name?.trim()) {
    return { ok: false, error: "Necesitás un cliente o un nombre walk-in." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    _location_id: session.currentLocationId ?? "",
    _starts_at: parsed.data.starts_at,
    _ends_at: parsed.data.ends_at,
    _client_id: parsed.data.client_id ?? undefined,
    _walk_in_name: parsed.data.walk_in_name ?? undefined,
    _service_ids: parsed.data.service_ids,
    _professional_ids: parsed.data.professional_ids,
    _room_ids: parsed.data.room_ids,
    _notes: parsed.data.notes ?? undefined,
    _status: parsed.data.status,
  });

  if (error) {
    // Postgres SQLSTATE 23P01 = exclusion violation (overbooking)
    if (error.code === "23P01") {
      return { ok: false, error: "Hay un solapamiento: profesional o cabina ya ocupados en ese horario." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/turnero");
  revalidatePath("/app");
  return { ok: true, data: { id: data as unknown as string } };
}

export async function updateAppointmentStatusAction(
  id: string,
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show",
): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      status,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/turnero");
  return { ok: true, data: undefined };
}

const updateSchema = z.object({
  appointment_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  client_id: z.string().uuid().optional().nullable(),
  walk_in_name: z.string().optional().nullable(),
  service_ids: z.array(z.string().uuid()),
  professional_ids: z.array(z.string().uuid()).min(1),
  room_ids: z.array(z.string().uuid()),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * Update completo del turno: tiempos + cliente + servicios + profesionales + cabinas + notas.
 * Hace replace de las junctions (delete + insert).
 */
export async function updateAppointmentAction(input: z.infer<typeof updateSchema>): Promise<Result> {
  await requireTenant();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (!parsed.data.client_id && !parsed.data.walk_in_name?.trim()) {
    return { ok: false, error: "Necesitás un cliente o un nombre walk-in." };
  }

  const supabase = await createClient();

  // 1) cargar servicios para snapshot de precio/duración
  const { data: servicesRows } = await supabase
    .from("services")
    .select("id, price_cents, duration_minutes")
    .in("id", parsed.data.service_ids);

  const totalCents = (servicesRows ?? []).reduce((s, x) => s + (x.price_cents ?? 0), 0);

  // 2) update appointment + delete junctions
  const { error: e1 } = await supabase
    .from("appointments")
    .update({
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      client_id: parsed.data.client_id ?? null,
      walk_in_name: parsed.data.walk_in_name?.trim() || null,
      notes: parsed.data.notes ?? null,
      total_cents: totalCents,
    })
    .eq("id", parsed.data.appointment_id);
  if (e1) {
    if (e1.code === "23P01") return { ok: false, error: "Hay un solapamiento de horarios." };
    return { ok: false, error: e1.message };
  }

  // 3) replace junctions
  await supabase.from("appointment_services").delete().eq("appointment_id", parsed.data.appointment_id);
  await supabase.from("appointment_professionals").delete().eq("appointment_id", parsed.data.appointment_id);
  await supabase.from("appointment_rooms").delete().eq("appointment_id", parsed.data.appointment_id);

  if (parsed.data.service_ids.length > 0) {
    const rows = parsed.data.service_ids.map((sid, i) => {
      const sv = (servicesRows ?? []).find((x) => x.id === sid);
      return {
        appointment_id: parsed.data.appointment_id,
        service_id: sid,
        price_cents_snapshot: sv?.price_cents ?? 0,
        duration_minutes_snapshot: sv?.duration_minutes ?? 60,
        sort_order: i + 1,
      };
    });
    await supabase.from("appointment_services").insert(rows);
  }

  if (parsed.data.professional_ids.length > 0) {
    const rows = parsed.data.professional_ids.map((pid, i) => ({
      appointment_id: parsed.data.appointment_id,
      professional_id: pid,
      is_primary: i === 0,
    }));
    const { error: ep } = await supabase.from("appointment_professionals").insert(rows);
    if (ep && ep.code === "23P01") return { ok: false, error: "Profesional ocupado en ese horario." };
  }

  if (parsed.data.room_ids.length > 0) {
    const rows = parsed.data.room_ids.map((rid) => ({
      appointment_id: parsed.data.appointment_id,
      room_id: rid,
    }));
    const { error: er } = await supabase.from("appointment_rooms").insert(rows);
    if (er && er.code === "23P01") return { ok: false, error: "Cabina ocupada en ese horario." };
  }

  revalidatePath("/app/turnero");
  return { ok: true, data: undefined };
}

export async function deleteAppointmentAction(id: string): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/turnero");
  return { ok: true, data: undefined };
}

const moveSchema = z.object({
  appointment_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  professional_id: z.string().uuid().optional(),
});

/**
 * Mueve un turno (cambia starts_at, ends_at y opcionalmente profesional).
 * Anti-overbooking: si el turno se solapa con otro activo del mismo profesional/cabina,
 * el constraint EXCLUDE GIST lanza SQLSTATE 23P01 y devolvemos error UX.
 */
export async function moveAppointmentAction(input: z.infer<typeof moveSchema>): Promise<Result> {
  await requireTenant();
  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = await createClient();

  // 1) update times
  const { error: e1 } = await supabase
    .from("appointments")
    .update({ starts_at: parsed.data.starts_at, ends_at: parsed.data.ends_at })
    .eq("id", parsed.data.appointment_id);

  if (e1) {
    if (e1.code === "23P01") {
      return { ok: false, error: "Hay un solapamiento: profesional o cabina ya ocupados en ese horario." };
    }
    return { ok: false, error: e1.message };
  }

  // 2) cambio de profesional (opcional)
  if (parsed.data.professional_id) {
    // Borrar junctions actuales y poner solo el nuevo
    const { error: edel } = await supabase
      .from("appointment_professionals")
      .delete()
      .eq("appointment_id", parsed.data.appointment_id);
    if (edel) return { ok: false, error: edel.message };

    const { error: eins } = await supabase
      .from("appointment_professionals")
      .insert({ appointment_id: parsed.data.appointment_id, professional_id: parsed.data.professional_id, is_primary: true });
    if (eins) {
      if (eins.code === "23P01") {
        return { ok: false, error: "Ese profesional ya tiene un turno solapado." };
      }
      return { ok: false, error: eins.message };
    }
  }

  revalidatePath("/app/turnero");
  return { ok: true, data: undefined };
}
