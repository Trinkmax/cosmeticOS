"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional().or(z.literal("")).nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#06b6d4"),
  location_id: z.string().uuid(),
  is_active: z.boolean().default(true),
});

export type Result = { ok: true } | { ok: false; error: string };

export async function createRoomAction(input: z.infer<typeof schema>): Promise<Result> {
  const session = await requireTenant();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase.from("rooms").insert({
    tenant_id: session.currentTenantId,
    location_id: parsed.data.location_id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    color: parsed.data.color,
    is_active: parsed.data.is_active,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/cabinas");
  return { ok: true };
}

export async function updateRoomAction(roomId: string, input: z.infer<typeof schema>): Promise<Result> {
  await requireTenant();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("rooms")
    .update({
      location_id: parsed.data.location_id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      color: parsed.data.color,
      is_active: parsed.data.is_active,
    })
    .eq("id", roomId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/cabinas");
  return { ok: true };
}

export async function deleteRoomAction(roomId: string): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    if (error.code === "23503") {
      const { error: e2 } = await supabase.from("rooms").update({ is_active: false }).eq("id", roomId);
      if (e2) return { ok: false, error: e2.message };
      revalidatePath("/app/cabinas");
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/cabinas");
  return { ok: true };
}
