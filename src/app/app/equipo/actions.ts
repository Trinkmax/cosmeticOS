"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

const professionalSchema = z.object({
  display_name: z.string().min(1).max(80),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone_e164: z.string().optional().or(z.literal("")).nullable(),
  bio: z.string().max(500).optional().or(z.literal("")).nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  is_active: z.boolean().default(true),
  online_bookable: z.boolean().default(true),
});

export type Result = { ok: true; data?: unknown } | { ok: false; error: string };

export async function createProfessionalAction(_prev: Result | null, formData: FormData): Promise<Result> {
  const session = await requireTenant();
  const parsed = professionalSchema.safeParse({
    display_name: formData.get("display_name"),
    email: formData.get("email") || null,
    phone_e164: formData.get("phone_e164") || null,
    bio: formData.get("bio") || null,
    color: formData.get("color") || "#8b5cf6",
    is_active: formData.get("is_active") === "on",
    online_bookable: formData.get("online_bookable") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .insert({
      tenant_id: session.currentTenantId,
      display_name: parsed.data.display_name,
      email: parsed.data.email ?? null,
      phone_e164: parsed.data.phone_e164 ?? null,
      bio: parsed.data.bio ?? null,
      color: parsed.data.color,
      is_active: parsed.data.is_active,
      online_bookable: parsed.data.online_bookable,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/equipo");
  return { ok: true, data };
}

export async function deleteProfessionalAction(id: string): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("professionals").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      const { error: e2 } = await supabase.from("professionals").update({ is_active: false }).eq("id", id);
      if (e2) return { ok: false, error: e2.message };
      revalidatePath("/app/equipo");
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/equipo");
  return { ok: true };
}

const blockSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
});

const scheduleSchema = z.record(z.string(), z.object({
  closed: z.boolean(),
  blocks: z.array(blockSchema),
}));

const WEEKDAY_MAP: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/**
 * Reemplaza completo el schedule semanal del profesional.
 * Cada bloque del día se guarda como una row en professional_schedules.
 */
export async function updateProfessionalScheduleAction(
  professionalId: string,
  schedule: z.infer<typeof scheduleSchema>,
): Promise<Result> {
  const session = await requireTenant();
  const parsed = scheduleSchema.safeParse(schedule);
  if (!parsed.success) return { ok: false, error: "Horarios inválidos" };

  const supabase = await createClient();

  // Verificar que el profesional es del tenant actual
  const { data: prof } = await supabase
    .from("professionals")
    .select("id, tenant_id")
    .eq("id", professionalId)
    .single();
  if (!prof || prof.tenant_id !== session.currentTenantId) {
    return { ok: false, error: "Profesional no encontrado" };
  }

  // Borrar TODOS los schedules actuales
  await supabase.from("professional_schedules").delete().eq("professional_id", professionalId);

  // Insertar bloques nuevos
  const rows: Array<{
    tenant_id: string;
    professional_id: string;
    location_id: string | null;
    weekday: number;
    start_time: string;
    end_time: string;
    valid_from: string;
  }> = [];

  const validFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const locationId = session.currentLocationId ?? null;

  for (const [dayKey, day] of Object.entries(parsed.data)) {
    if (day.closed) continue;
    const wd = WEEKDAY_MAP[dayKey];
    if (wd === undefined) continue;
    for (const block of day.blocks) {
      if (block.close <= block.open) continue;
      rows.push({
        tenant_id: session.currentTenantId,
        professional_id: professionalId,
        location_id: locationId,
        weekday: wd,
        start_time: block.open + ":00",
        end_time: block.close + ":00",
        valid_from: validFrom,
      });
    }
  }

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("professional_schedules").insert(rows);
    if (insErr) return { ok: false, error: insErr.message };
  }

  revalidatePath("/app/equipo");
  return { ok: true };
}

export async function updateProfessionalAction(id: string, input: {
  display_name: string;
  email: string | null;
  phone_e164: string | null;
  bio: string | null;
  color: string;
  is_active: boolean;
  online_bookable: boolean;
}): Promise<Result> {
  await requireTenant();
  const parsed = professionalSchema.safeParse({
    display_name: input.display_name,
    email: input.email || null,
    phone_e164: input.phone_e164 || null,
    bio: input.bio || null,
    color: input.color,
    is_active: input.is_active,
    online_bookable: input.online_bookable,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update({
      display_name: parsed.data.display_name,
      email: parsed.data.email ?? null,
      phone_e164: parsed.data.phone_e164 ?? null,
      bio: parsed.data.bio ?? null,
      color: parsed.data.color,
      is_active: parsed.data.is_active,
      online_bookable: parsed.data.online_bookable,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/equipo");
  return { ok: true };
}
