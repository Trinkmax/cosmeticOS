import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  switchTenantAction,
  switchLocationAction,
} from "@/app/(onboarding)/select-tenant/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.currentTenantId) {
    redirect(session.tenants.length === 0 ? "/onboarding" : "/select-tenant");
  }

  const supabase = await createClient();
  const [{ data: profile }, { data: locations }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", session.user.id).maybeSingle(),
    supabase
      .from("locations")
      .select("id, name")
      .eq("tenant_id", session.currentTenantId)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("name"),
  ]);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar role={session.currentRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={{ fullName: profile?.full_name ?? "", email: session.user.email ?? "" }}
          tenants={session.tenants}
          currentTenantId={session.currentTenantId}
          locations={locations ?? []}
          currentLocationId={session.currentLocationId}
          role={session.currentRole}
          switchTenant={switchTenantAction}
          switchLocation={switchLocationAction}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
