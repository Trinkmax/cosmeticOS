import { Percent, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireTenant, isProfessional } from "@/lib/auth/session";
import { formatCents } from "@/lib/utils";

export default async function MisComisionesPage() {
  const session = await requireTenant();
  if (!isProfessional(session)) redirect("/app/comisiones");

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("tenant_id", session.currentTenantId)
    .single();

  const { data: prof } = member
    ? await supabase
        .from("professionals")
        .select("id, display_name, color")
        .eq("member_id", member.id)
        .maybeSingle()
    : { data: null };

  if (!prof) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-8">
        <EmptyState icon={Percent} title="Tu cuenta no está vinculada a un profesional" />
      </div>
    );
  }

  const [{ data: calcs }, { data: payouts }] = await Promise.all([
    supabase
      .from("commission_calculations")
      .select("id, base_cents, commission_cents, calculated_at, status")
      .eq("professional_id", prof.id)
      .order("calculated_at", { ascending: false })
      .limit(50),
    supabase
      .from("commission_payouts")
      .select("id, period_start, period_end, total_cents, status, paid_at")
      .eq("professional_id", prof.id)
      .order("period_end", { ascending: false })
      .limit(20),
  ]);

  const pending = (calcs ?? []).filter((c) => c.status === "pending");
  const pendingTotal = pending.reduce((s, c) => s + c.commission_cents, 0);
  const monthRevenue = (calcs ?? []).reduce((s, c) => s + c.base_cents, 0);

  return (
    <>
      <PageHeader
        title="Mis comisiones"
        description="Tu liquidación pendiente y el histórico de pagos."
      />

      <div className="container mx-auto px-4 py-6 md:px-8 space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-blush-200 bg-gradient-to-br from-blush-50 to-peach-50 p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-blush-700">Pendiente de cobro</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{formatCents(pendingTotal)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{pending.length} cálculos</div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Base generada</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{formatCents(monthRevenue)}</div>
            <div className="mt-1 text-xs text-muted-foreground">últimas 50 transacciones</div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Liquidaciones</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{payouts?.length ?? 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">históricas</div>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalle</h2>
          {(calcs ?? []).length === 0 ? (
            <EmptyState icon={Sparkles} title="Sin comisiones todavía" description="Cuando se cierre un turno se calcula tu comisión." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-right">Base</th>
                    <th className="px-4 py-3 text-right">Comisión</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {calcs!.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {new Date(c.calculated_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCents(c.base_cents)}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatCents(c.commission_cents)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={c.status === "paid" ? "success" : c.status === "pending" ? "warning" : "soft"} className="text-[10px]">
                          {c.status === "paid" ? "Pagada" : c.status === "pending" ? "Pendiente" : c.status === "approved" ? "Aprobada" : c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {(payouts ?? []).length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Liquidaciones</h2>
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Período</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payouts!.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {new Date(p.period_start).toLocaleDateString("es-AR")} → {new Date(p.period_end).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCents(p.total_cents)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={p.status === "paid" ? "success" : "soft"} className="text-[10px]">
                          {p.status === "paid" ? "Pagada" : p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
