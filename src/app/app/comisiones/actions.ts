"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

const ruleSchema = z.object({
  name: z.string().min(1).max(120),
  applies_to: z.enum(["service", "product", "package", "all"]),
  professional_id: z.string().uuid().optional().nullable(),
  service_id: z.string().uuid().optional().nullable(),
  rule_type: z.enum(["percent", "fixed"]),
  value_bps_or_cents: z.coerce.number().int().min(0),
  priority: z.coerce.number().int().min(0).default(100),
  is_active: z.boolean().default(true),
});

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

export async function createCommissionRuleAction(
  input: z.infer<typeof ruleSchema>,
): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = ruleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_rules")
    .insert({
      tenant_id: session.currentTenantId,
      name: parsed.data.name,
      applies_to: parsed.data.applies_to,
      professional_id: parsed.data.professional_id ?? null,
      service_id: parsed.data.service_id ?? null,
      rule_type: parsed.data.rule_type,
      value_bps_or_cents: parsed.data.value_bps_or_cents,
      priority: parsed.data.priority,
      is_active: parsed.data.is_active,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/comisiones");
  return { ok: true, data: { id: data!.id } };
}

export async function generatePayoutAction(input: {
  professional_id: string;
  period_start: string;
  period_end: string;
}): Promise<Result<{ id: string; total_cents: number }>> {
  const session = await requireTenant();
  const supabase = await createClient();

  // Sumar calculations pending del profesional en el rango
  const { data: calcs } = await supabase
    .from("commission_calculations")
    .select("id, commission_cents")
    .eq("tenant_id", session.currentTenantId)
    .eq("professional_id", input.professional_id)
    .eq("status", "pending")
    .gte("calculated_at", input.period_start)
    .lte("calculated_at", input.period_end);

  const total = (calcs ?? []).reduce((s, c) => s + c.commission_cents, 0);

  const { data: payout, error } = await supabase
    .from("commission_payouts")
    .insert({
      tenant_id: session.currentTenantId,
      professional_id: input.professional_id,
      period_start: input.period_start,
      period_end: input.period_end,
      total_cents: total,
      status: "draft",
      created_by: session.user.id,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  // Linkear las calculations al payout
  if ((calcs ?? []).length > 0) {
    await supabase
      .from("commission_calculations")
      .update({ payout_id: payout!.id, status: "approved" })
      .in("id", calcs!.map((c) => c.id));
  }

  revalidatePath("/app/comisiones");
  return { ok: true, data: { id: payout!.id, total_cents: total } };
}

export async function markPayoutPaidAction(payoutId: string): Promise<Result> {
  const session = await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_payouts")
    .update({ status: "paid", paid_at: new Date().toISOString(), paid_by: session.user.id })
    .eq("id", payoutId);
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("commission_calculations")
    .update({ status: "paid" })
    .eq("payout_id", payoutId);

  revalidatePath("/app/comisiones");
  return { ok: true, data: undefined };
}
