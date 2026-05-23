"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

// ─── Cuentas de caja ────────────────────────────────────────────────────────

const accountSchema = z.object({
  name: z.string().min(1).max(80),
  kind: z.enum(["cash", "mercadopago", "modo", "bank", "card", "crypto", "other"]),
  is_active: z.boolean().default(true),
});

export async function createCashAccountAction(input: z.infer<typeof accountSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  if (!session.currentLocationId) return { ok: false, error: "Elegí una sucursal antes." };
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_accounts")
    .insert({
      tenant_id: session.currentTenantId,
      location_id: session.currentLocationId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      currency: "ARS",
      is_active: parsed.data.is_active,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/caja");
  return { ok: true, data: { id: data!.id } };
}

export async function updateCashAccountAction(accountId: string, input: z.infer<typeof accountSchema>): Promise<Result> {
  await requireTenant();
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_accounts")
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      is_active: parsed.data.is_active,
    })
    .eq("id", accountId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/caja");
  return { ok: true, data: undefined };
}

export async function deleteCashAccountAction(accountId: string): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  // Soft delete: desactivar (preserva integridad del ledger histórico)
  const { error } = await supabase
    .from("cash_accounts")
    .update({ is_active: false })
    .eq("id", accountId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/caja");
  return { ok: true, data: undefined };
}

const paymentSchema = z.object({
  account_id: z.string().uuid(),
  client_id: z.string().uuid().optional().nullable(),
  appointment_id: z.string().uuid().optional().nullable(),
  amount_cents: z.coerce.number().int().min(1),
  kind: z.enum(["service", "product", "package", "tip", "refund", "other"]),
  notes: z.string().max(500).optional().or(z.literal("")).nullable(),
});

export async function registerPaymentAction(input: z.infer<typeof paymentSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  if (!session.currentLocationId) return { ok: false, error: "Elegí una sucursal antes." };
  const locationId = session.currentLocationId;
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();

  const { data: openSession } = await supabase
    .from("cash_sessions")
    .select("id")
    .eq("location_id", locationId)
    .eq("status", "open")
    .maybeSingle();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      tenant_id: session.currentTenantId,
      location_id: locationId,
      client_id: parsed.data.client_id ?? null,
      appointment_id: parsed.data.appointment_id ?? null,
      cash_session_id: openSession?.id ?? null,
      account_id: parsed.data.account_id,
      amount_cents: parsed.data.amount_cents,
      kind: parsed.data.kind,
      status: "completed",
      notes: parsed.data.notes ?? null,
      created_by: session.user.id,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("cash_movements").insert({
    tenant_id: session.currentTenantId,
    location_id: locationId,
    account_id: parsed.data.account_id,
    cash_session_id: openSession?.id ?? null,
    direction: parsed.data.kind === "refund" ? "out" : "in",
    amount_cents: parsed.data.amount_cents,
    kind: parsed.data.kind === "refund" ? "refund" : "payment",
    payment_id: data!.id,
    description: parsed.data.notes ?? null,
    created_by: session.user.id,
  });

  revalidatePath("/app/caja");
  return { ok: true, data: { id: data!.id } };
}

export async function openCashSessionAction(notes: string): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_sessions")
    .insert({
      tenant_id: session.currentTenantId,
      location_id: session.currentLocationId ?? "",
      opened_by: session.user.id,
      opening_notes: notes || null,
      status: "open",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya hay una caja abierta en esta sucursal." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/caja");
  return { ok: true, data: { id: data!.id } };
}

const closeSchema = z.object({
  session_id: z.string().uuid(),
  counted_totals: z.record(z.string(), z.coerce.number()),
  notes: z.string().max(500).optional().nullable(),
});

export async function closeCashSessionAction(input: z.infer<typeof closeSchema>): Promise<Result> {
  const session = await requireTenant();
  const parsed = closeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  const supabase = await createClient();

  // Calcular expected totals
  const { data: movements } = await supabase
    .from("cash_movements")
    .select("account_id, direction, amount_cents")
    .eq("cash_session_id", parsed.data.session_id);

  const expected: Record<string, number> = {};
  for (const m of movements ?? []) {
    expected[m.account_id] = (expected[m.account_id] ?? 0) + (m.direction === "in" ? m.amount_cents : -m.amount_cents);
  }

  const difference: Record<string, number> = {};
  for (const accId of new Set([...Object.keys(expected), ...Object.keys(parsed.data.counted_totals)])) {
    difference[accId] = (parsed.data.counted_totals[accId] ?? 0) - (expected[accId] ?? 0);
  }

  const { error } = await supabase
    .from("cash_sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: session.user.id,
      closing_notes: parsed.data.notes ?? null,
      expected_totals: expected,
      counted_totals: parsed.data.counted_totals,
      difference_totals: difference,
    })
    .eq("id", parsed.data.session_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/caja");
  return { ok: true, data: undefined };
}
