"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { serviceCategorySchema, serviceCreateSchema } from "@/lib/schemas/services";

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

export async function createServiceAction(_prev: Result<{ id: string }> | null, formData: FormData): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = serviceCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    category_id: formData.get("category_id") || null,
    duration_minutes: formData.get("duration_minutes"),
    price_cents: formData.get("price_cents"),
    color: formData.get("color") || "#a78bfa",
    is_active: formData.get("is_active") === "on",
    requires_consent: formData.get("requires_consent") === "on",
    requires_room: formData.get("requires_room") === "on",
    online_bookable: formData.get("online_bookable") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      tenant_id: session.currentTenantId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category_id: parsed.data.category_id ?? null,
      duration_minutes: parsed.data.duration_minutes,
      price_cents: parsed.data.price_cents,
      color: parsed.data.color,
      is_active: parsed.data.is_active,
      requires_consent: parsed.data.requires_consent,
      requires_room: parsed.data.requires_room,
      online_bookable: parsed.data.online_bookable,
      created_by: session.user.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/servicios");
  return { ok: true, data: { id: data!.id } };
}

export async function createCategoryAction(_prev: Result | null, formData: FormData): Promise<Result> {
  const session = await requireTenant();
  const parsed = serviceCategorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || "#a78bfa",
    sort_order: 0,
  });
  if (!parsed.success) return { ok: false, error: "Nombre inválido" };

  const supabase = await createClient();
  const { error } = await supabase.from("service_categories").insert({
    tenant_id: session.currentTenantId,
    name: parsed.data.name,
    color: parsed.data.color,
    sort_order: parsed.data.sort_order,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/servicios");
  return { ok: true, data: undefined };
}

export async function toggleServiceActiveAction(serviceId: string, active: boolean): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ is_active: active }).eq("id", serviceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/servicios");
  return { ok: true, data: undefined };
}

export async function deleteServiceAction(serviceId: string): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", serviceId);
  if (error) {
    if (error.code === "23503") {
      const { error: e2 } = await supabase.from("services").update({ is_active: false }).eq("id", serviceId);
      if (e2) return { ok: false, error: e2.message };
      revalidatePath("/app/servicios");
      return { ok: true, data: undefined };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/servicios");
  return { ok: true, data: undefined };
}

export async function updateServiceAction(
  serviceId: string,
  _prev: Result<{ id: string }> | null,
  formData: FormData,
): Promise<Result<{ id: string }>> {
  await requireTenant();
  const parsed = serviceCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    category_id: formData.get("category_id") || null,
    duration_minutes: formData.get("duration_minutes"),
    price_cents: formData.get("price_cents"),
    color: formData.get("color") || "#a78bfa",
    is_active: formData.get("is_active") === "on",
    requires_consent: formData.get("requires_consent") === "on",
    requires_room: formData.get("requires_room") === "on",
    online_bookable: formData.get("online_bookable") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category_id: parsed.data.category_id ?? null,
      duration_minutes: parsed.data.duration_minutes,
      price_cents: parsed.data.price_cents,
      color: parsed.data.color,
      is_active: parsed.data.is_active,
      requires_consent: parsed.data.requires_consent,
      requires_room: parsed.data.requires_room,
      online_bookable: parsed.data.online_bookable,
    })
    .eq("id", serviceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/servicios");
  return { ok: true, data: { id: serviceId } };
}
