"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

const packageSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")).nullable(),
  price_cents: z.coerce.number().int().min(0),
  validity_days: z.coerce.number().int().min(1).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f9b8c1"),
  items: z.array(z.object({ service_id: z.string().uuid(), sessions_included: z.coerce.number().int().min(1) })).min(1),
});

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

export async function createPackageAction(input: z.infer<typeof packageSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = await createClient();
  const { data: pkg, error: pkgErr } = await supabase
    .from("packages")
    .insert({
      tenant_id: session.currentTenantId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price_cents: parsed.data.price_cents,
      validity_days: parsed.data.validity_days ?? null,
      color: parsed.data.color,
    })
    .select("id")
    .single();
  if (pkgErr) return { ok: false, error: pkgErr.message };

  const { error: itemsErr } = await supabase.from("package_services").insert(
    parsed.data.items.map((i) => ({
      package_id: pkg!.id,
      service_id: i.service_id,
      sessions_included: i.sessions_included,
    })),
  );
  if (itemsErr) return { ok: false, error: itemsErr.message };

  revalidatePath("/app/paquetes");
  return { ok: true, data: { id: pkg!.id } };
}

export async function updatePackageAction(
  packageId: string,
  input: z.infer<typeof packageSchema>,
): Promise<Result<{ id: string }>> {
  await requireTenant();
  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("packages")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price_cents: parsed.data.price_cents,
      validity_days: parsed.data.validity_days ?? null,
      color: parsed.data.color,
    })
    .eq("id", packageId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("package_services").delete().eq("package_id", packageId);
  if (parsed.data.items.length > 0) {
    const { error: itErr } = await supabase.from("package_services").insert(
      parsed.data.items.map((i) => ({
        package_id: packageId,
        service_id: i.service_id,
        sessions_included: i.sessions_included,
      })),
    );
    if (itErr) return { ok: false, error: itErr.message };
  }
  revalidatePath("/app/paquetes");
  return { ok: true, data: { id: packageId } };
}

export async function deletePackageAction(packageId: string): Promise<Result<undefined>> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("packages").delete().eq("id", packageId);
  if (error) {
    if (error.code === "23503") {
      const { error: e2 } = await supabase.from("packages").update({ is_active: false }).eq("id", packageId);
      if (e2) return { ok: false, error: e2.message };
      revalidatePath("/app/paquetes");
      return { ok: true, data: undefined };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/paquetes");
  return { ok: true, data: undefined };
}

const sellSchema = z.object({
  package_id: z.string().uuid(),
  client_id: z.string().uuid(),
  account_id: z.string().uuid().optional().nullable(),
  amount_paid_cents: z.coerce.number().int().min(0),
});

export async function sellPackageAction(input: z.infer<typeof sellSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = sellSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();

  // Cargar paquete + items
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, name, price_cents, validity_days, package_services(service_id, sessions_included)")
    .eq("id", parsed.data.package_id)
    .single();
  if (!pkg) return { ok: false, error: "Paquete no encontrado" };

  const expiresAt = pkg.validity_days
    ? new Date(Date.now() + pkg.validity_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data: cp, error: cpErr } = await supabase
    .from("client_packages")
    .insert({
      tenant_id: session.currentTenantId,
      client_id: parsed.data.client_id,
      package_id: pkg.id,
      total_paid_cents: parsed.data.amount_paid_cents,
      expires_at: expiresAt,
      created_by: session.user.id,
    })
    .select("id")
    .single();
  if (cpErr) return { ok: false, error: cpErr.message };

  // Crear balances iniciales
  const balances = pkg.package_services.map((it: { service_id: string; sessions_included: number }) => ({
    client_package_id: cp!.id,
    service_id: it.service_id,
    sessions_total: it.sessions_included,
    sessions_used: 0,
  }));
  if (balances.length > 0) {
    const { error: balErr } = await supabase.from("client_package_balances").insert(balances);
    if (balErr) return { ok: false, error: balErr.message };
  }

  // Si hay cuenta de caja Y location activa, registrar el pago
  if (parsed.data.account_id && parsed.data.amount_paid_cents > 0 && session.currentLocationId) {
    await supabase.from("payments").insert({
      tenant_id: session.currentTenantId,
      location_id: session.currentLocationId,
      client_id: parsed.data.client_id,
      cash_session_id: null,
      account_id: parsed.data.account_id,
      amount_cents: parsed.data.amount_paid_cents,
      kind: "package",
      status: "completed",
      notes: `Venta de paquete: ${pkg.name}`,
      created_by: session.user.id,
    });
  }

  revalidatePath("/app/paquetes");
  revalidatePath(`/app/clientes/${parsed.data.client_id}`);
  return { ok: true, data: { id: cp!.id } };
}
