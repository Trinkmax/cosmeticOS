"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

// ─── Sucursales ─────────────────────────────────────────────────────────────

const blockSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
});

const daySchema = z.object({
  closed: z.boolean(),
  blocks: z.array(blockSchema),
});

const openingHoursSchema = z.record(z.string(), daySchema);

const locationSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,40}$/),
  address: z.string().max(200).optional().or(z.literal("")).nullable(),
  city: z.string().max(80).optional().or(z.literal("")).nullable(),
  province: z.string().max(80).optional().or(z.literal("")).nullable(),
  timezone: z.string().min(1),
  phone_e164: z.string().max(20).optional().or(z.literal("")).nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  is_active: z.boolean().default(true),
  opening_hours: openingHoursSchema,
});

export async function createLocationAction(input: z.infer<typeof locationSchema>): Promise<Result<{ id: string }>> {
  const session = await requireTenant();
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({
      tenant_id: session.currentTenantId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      province: parsed.data.province ?? null,
      timezone: parsed.data.timezone,
      phone_e164: parsed.data.phone_e164 ?? null,
      email: parsed.data.email ?? null,
      is_active: parsed.data.is_active,
      opening_hours: parsed.data.opening_hours,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/config/sucursales");
  return { ok: true, data: { id: data!.id } };
}

export async function updateLocationAction(locationId: string, input: z.infer<typeof locationSchema>): Promise<Result> {
  await requireTenant();
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      province: parsed.data.province ?? null,
      timezone: parsed.data.timezone,
      phone_e164: parsed.data.phone_e164 ?? null,
      email: parsed.data.email ?? null,
      is_active: parsed.data.is_active,
      opening_hours: parsed.data.opening_hours,
    })
    .eq("id", locationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/config/sucursales");
  return { ok: true, data: undefined };
}

// ─── Miembros / Invitaciones ────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "reception", "professional", "advisor"]),
});

export async function inviteMemberAction(input: z.infer<typeof inviteSchema>): Promise<Result<{ id: string; token: string }>> {
  const session = await requireTenant();
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      tenant_id: session.currentTenantId,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      invited_by: session.user.id,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya existe una invitación para ese correo." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/config/miembros");
  return { ok: true, data: { id: data!.id, token } };
}

export async function updateMemberRoleAction(memberId: string, role: "owner" | "admin" | "reception" | "professional" | "advisor"): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("members").update({ role }).eq("id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/config/miembros");
  return { ok: true, data: undefined };
}

export async function disableMemberAction(memberId: string): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ status: "disabled", disabled_at: new Date().toISOString() })
    .eq("id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/config/miembros");
  return { ok: true, data: undefined };
}

// ─── Branding ───────────────────────────────────────────────────────────────

const brandingSchema = z.object({
  logo_url: z.string().url().optional().or(z.literal("")).nullable(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  google_review_url: z.string().url().optional().or(z.literal("")).nullable(),
  booking_link_enabled: z.boolean().default(false),
});

export async function updateBrandingAction(input: z.infer<typeof brandingSchema>): Promise<Result> {
  const session = await requireTenant();
  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();

  const branding: Record<string, string | null> = {};
  if (parsed.data.logo_url) branding.logo_url = parsed.data.logo_url;
  if (parsed.data.primary_color) branding.primary_color = parsed.data.primary_color;

  const { error } = await supabase
    .from("tenant_settings")
    .update({
      branding,
      booking_link_enabled: parsed.data.booking_link_enabled,
      google_review_url: parsed.data.google_review_url ?? null,
    })
    .eq("tenant_id", session.currentTenantId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/config/branding");
  return { ok: true, data: undefined };
}

// ─── Cuenta ─────────────────────────────────────────────────────────────────

const tenantUpdateSchema = z.object({
  name: z.string().min(1).max(120),
  timezone: z.string().min(1),
  currency: z.string().length(3),
});

export async function updateTenantAction(input: z.infer<typeof tenantUpdateSchema>): Promise<Result> {
  const session = await requireTenant();
  const parsed = tenantUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .update({
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      currency: parsed.data.currency,
    })
    .eq("id", session.currentTenantId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/config");
  revalidatePath("/app/config/cuenta");
  return { ok: true, data: undefined };
}
