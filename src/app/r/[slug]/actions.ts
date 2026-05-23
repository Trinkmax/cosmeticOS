"use server";

import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { createClient } from "@/lib/supabase/server";

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

const bookingSchema = z.object({
  tenant_slug: z.string(),
  full_name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  service_ids: z.array(z.string().uuid()).min(1),
  professional_id: z.string().uuid(),
  location_id: z.string().uuid(),
  starts_at: z.string().datetime(),
});

export async function publicBookAction(input: z.infer<typeof bookingSchema>): Promise<Result<{ appointment_id: string }>> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  let e164: string;
  try {
    const p = parsePhoneNumberWithError(parsed.data.phone, "AR");
    if (!p.isValid()) return { ok: false, error: "Teléfono inválido" };
    e164 = p.number;
  } catch {
    return { ok: false, error: "Teléfono inválido" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_create_booking", {
    _tenant_slug: parsed.data.tenant_slug,
    _full_name: parsed.data.full_name,
    _phone_e164: e164,
    _email: parsed.data.email ?? "",
    _service_ids: parsed.data.service_ids,
    _professional_id: parsed.data.professional_id,
    _location_id: parsed.data.location_id,
    _starts_at: parsed.data.starts_at,
  });

  if (error) {
    if (error.code === "23P01") return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro." };
    return { ok: false, error: error.message };
  }

  const result = data as { appointment_id: string };
  return { ok: true, data: { appointment_id: result.appointment_id } };
}

export async function publicGetAvailabilityAction(input: {
  tenant_slug: string;
  professional_id: string;
  date: string;
  duration_minutes: number;
}): Promise<Array<{ starts_at: string; ends_at: string }>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_get_availability", {
    _tenant_slug: input.tenant_slug,
    _professional_id: input.professional_id,
    _date: input.date,
    _duration_minutes: input.duration_minutes,
  });
  return (data as Array<{ starts_at: string; ends_at: string }>) ?? [];
}
