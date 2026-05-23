"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

const productSchema = z.object({
  name: z.string().min(1).max(120),
  sku: z.string().max(60).optional().or(z.literal("")).nullable(),
  price_cents: z.coerce.number().int().min(0),
  cost_cents: z.coerce.number().int().min(0).optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  min_stock: z.coerce.number().int().min(0).default(0),
  stock_tracked: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

const inventorySchema = z.object({
  name: z.string().min(1).max(120),
  unit: z.string().min(1).max(30).default("unidad"),
  stock_quantity: z.coerce.number().min(0).default(0),
  min_stock: z.coerce.number().min(0).default(0),
  cost_cents: z.coerce.number().int().min(0).optional().nullable(),
});

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

export async function createProductAction(input: z.infer<typeof productSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      tenant_id: session.currentTenantId,
      name: parsed.data.name,
      sku: parsed.data.sku ?? null,
      price_cents: parsed.data.price_cents,
      cost_cents: parsed.data.cost_cents ?? null,
      stock_quantity: parsed.data.stock_quantity,
      min_stock: parsed.data.min_stock,
      stock_tracked: parsed.data.stock_tracked,
      is_active: parsed.data.is_active,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/stock");
  return { ok: true, data: { id: data!.id } };
}

export async function createInventoryAction(input: z.infer<typeof inventorySchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = inventorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      tenant_id: session.currentTenantId,
      name: parsed.data.name,
      unit: parsed.data.unit,
      stock_quantity: parsed.data.stock_quantity,
      min_stock: parsed.data.min_stock,
      cost_cents: parsed.data.cost_cents ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/stock");
  return { ok: true, data: { id: data!.id } };
}

export async function adjustProductStockAction(productId: string, delta: number): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { data: p } = await supabase.from("products").select("stock_quantity").eq("id", productId).single();
  if (!p) return { ok: false, error: "Producto no encontrado" };
  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: Math.max(0, (p.stock_quantity ?? 0) + delta) })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/stock");
  return { ok: true, data: undefined };
}
