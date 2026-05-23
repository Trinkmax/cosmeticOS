"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const tenantSchema = z.object({
  name: z.string().min(2, "El nombre del negocio es obligatorio").max(120),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{2,40}$/, "Slug inválido"),
  country: z.string().length(2).default("AR"),
  currency: z.string().length(3).default("ARS"),
  timezone: z.string().default("America/Argentina/Buenos_Aires"),
  locationName: z.string().min(2, "Nombre de sucursal obligatorio").max(80),
  locationAddress: z.string().optional().nullable(),
  locationPhone: z.string().optional().nullable(),
});

export type CreateTenantState =
  | { ok: true; tenantId: string; locationId: string }
  | { ok: false; error: string }
  | null;

export async function createTenantAction(
  _prev: CreateTenantState,
  formData: FormData,
): Promise<CreateTenantState> {
  const parsed = tenantSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    country: (formData.get("country") as string) || "AR",
    currency: (formData.get("currency") as string) || "ARS",
    timezone: (formData.get("timezone") as string) || "America/Argentina/Buenos_Aires",
    locationName: formData.get("locationName") || "Sucursal principal",
    locationAddress: formData.get("locationAddress") || null,
    locationPhone: formData.get("locationPhone") || null,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Sesión expirada. Iniciá sesión de nuevo." };
  }

  const { data, error } = await supabase.rpc("create_tenant", {
    _name: parsed.data.name,
    _slug: parsed.data.slug,
    _country: parsed.data.country,
    _currency: parsed.data.currency,
    _timezone: parsed.data.timezone,
    _location_name: parsed.data.locationName,
    _location_address: parsed.data.locationAddress ?? undefined,
    _location_phone: parsed.data.locationPhone ?? undefined,
  });

  if (error) {
    if (error.message.includes("duplicate key") && error.message.includes("slug")) {
      return { ok: false, error: "Ese nombre de URL ya está tomado. Probá otro." };
    }
    return { ok: false, error: error.message };
  }

  // Refresh session so JWT picks up the new tenant claims
  await supabase.auth.refreshSession();

  revalidatePath("/", "layout");
  const result = data as { tenant_id: string; location_id: string };
  return { ok: true, tenantId: result.tenant_id, locationId: result.location_id };
}
