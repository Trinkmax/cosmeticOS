"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { clientCreateSchema } from "@/lib/schemas/clients";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createClientAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireTenant();
  const parsed = clientCreateSchema.safeParse({
    full_name: formData.get("full_name"),
    phone_e164: formData.get("phone_e164") || null,
    email: formData.get("email") || null,
    birth_date: formData.get("birth_date") || null,
    gender: (formData.get("gender") as string) || null,
    dni: formData.get("dni") || null,
    notes: formData.get("notes") || null,
    tags: (formData.getAll("tags") as string[]).filter(Boolean),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      tenant_id: session.currentTenantId,
      full_name: parsed.data.full_name,
      phone_e164: parsed.data.phone_e164 ?? null,
      email: parsed.data.email ?? null,
      birth_date: parsed.data.birth_date || null,
      gender: parsed.data.gender ?? null,
      dni: parsed.data.dni ?? null,
      notes: parsed.data.notes ?? null,
      tags: parsed.data.tags,
      created_by: session.user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" && error.message.includes("phone_e164")) {
      return { ok: false, error: "Ya tenés un cliente con ese teléfono." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/clientes");
  return { ok: true, data: { id: data!.id } };
}

export async function updateClientAction(
  clientId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireTenant();
  const parsed = clientCreateSchema.safeParse({
    full_name: formData.get("full_name"),
    phone_e164: formData.get("phone_e164") || null,
    email: formData.get("email") || null,
    birth_date: formData.get("birth_date") || null,
    gender: (formData.get("gender") as string) || null,
    dni: formData.get("dni") || null,
    notes: formData.get("notes") || null,
    tags: (formData.getAll("tags") as string[]).filter(Boolean),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: parsed.data.full_name,
      phone_e164: parsed.data.phone_e164 ?? null,
      email: parsed.data.email ?? null,
      birth_date: parsed.data.birth_date || null,
      gender: parsed.data.gender ?? null,
      dni: parsed.data.dni ?? null,
      notes: parsed.data.notes ?? null,
      tags: parsed.data.tags,
    })
    .eq("id", clientId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${clientId}`);
  return { ok: true, data: undefined };
}

export async function deleteClientAction(clientId: string): Promise<ActionResult> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) {
    if (error.code === "23503") {
      // FK violation: hay appointments. Soft delete.
      const { error: e2 } = await supabase.from("clients").update({ is_active: false }).eq("id", clientId);
      if (e2) return { ok: false, error: e2.message };
      revalidatePath("/app/clientes");
      return { ok: true, data: undefined };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/clientes");
  return { ok: true, data: undefined };
}

export async function searchClientsAction(query: string) {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("search_clients", { _q: query, _limit: 10 });
  return data ?? [];
}
