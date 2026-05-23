import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | "reception" | "professional" | "advisor";

export type Session = {
  user: User;
  currentTenantId: string | null;
  currentLocationId: string | null;
  currentRole: AppRole | null;
  tenants: Array<{ id: string; slug: string; name: string; role: AppRole }>;
};

/**
 * Read JWT claims server-side. Validated by GoTrue.
 * Returns null if no authenticated user.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const claims = data.claims as Record<string, unknown> & {
    sub: string;
    current_tenant_id?: string;
    current_location_id?: string;
    current_role?: AppRole;
    tenants?: Array<{ id: string; slug: string; name: string; role: AppRole }>;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    user,
    currentTenantId: claims.current_tenant_id ?? null,
    currentLocationId: claims.current_location_id ?? null,
    currentRole: claims.current_role ?? null,
    tenants: claims.tenants ?? [],
  };
}

/**
 * Server Component / Server Action guard. Throws redirect if not authenticated.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Like requireSession but also ensures a tenant is selected.
 * Redirects to onboarding if user has no tenant yet.
 */
export async function requireTenant(): Promise<Session & { currentTenantId: string }> {
  const session = await requireSession();
  if (!session.currentTenantId) {
    redirect(session.tenants.length === 0 ? "/onboarding" : "/select-tenant");
  }
  return { ...session, currentTenantId: session.currentTenantId };
}

export function isAdmin(session: Session | null): boolean {
  return session?.currentRole === "owner" || session?.currentRole === "admin";
}

export function isStaff(session: Session | null): boolean {
  return session?.currentRole === "owner" || session?.currentRole === "admin" || session?.currentRole === "reception";
}

export function isProfessional(session: Session | null): boolean {
  return session?.currentRole === "professional";
}

/**
 * Guard de rutas admin-only: si no es owner/admin, redirige a /app.
 * Por convención el profesional verá su propio dashboard en /app.
 */
export async function requireAdmin(): Promise<Session & { currentTenantId: string }> {
  const session = await requireTenant();
  if (!isAdmin(session)) {
    redirect("/app");
  }
  return session;
}

/**
 * Guard menos estricto: permite owner/admin/reception (no profesional ni asesora).
 */
export async function requireStaff(): Promise<Session & { currentTenantId: string }> {
  const session = await requireTenant();
  if (!isStaff(session)) {
    redirect("/app");
  }
  return session;
}
