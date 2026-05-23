import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { TenantForm } from "./tenant-form";

export default async function CuentaPage() {
  const session = await requireAdmin();
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, country, currency, timezone, plan, status, trial_ends_at, created_at")
    .eq("id", session.currentTenantId)
    .maybeSingle();

  if (!tenant) return null;

  return (
    <>
      <PageHeader
        title="Cuenta"
        description="Datos del negocio, plan y zona horaria."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/config">
              <ArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="container mx-auto max-w-2xl px-4 py-8 md:px-8 space-y-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Plan actual</div>
              <div className="mt-1 text-lg font-semibold capitalize tracking-tight">{tenant.plan}</div>
            </div>
            <Badge variant={tenant.status === "active" ? "success" : "warning"}>{tenant.status}</Badge>
          </div>
          {tenant.plan === "trial" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Tu trial vence el {new Date(tenant.trial_ends_at).toLocaleDateString("es-AR")}.
            </p>
          )}
        </div>

        <TenantForm
          tenantId={tenant.id}
          initialName={tenant.name}
          initialTimezone={tenant.timezone}
          initialCurrency={tenant.currency}
          slug={tenant.slug}
          country={tenant.country}
        />
      </div>
    </>
  );
}
