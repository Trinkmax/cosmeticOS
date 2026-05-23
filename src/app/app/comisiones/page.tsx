import { Percent, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { formatCents } from "@/lib/utils";
import { NewRuleDialog, GeneratePayoutDialog, MarkPaidButton } from "./commission-dialogs";

export default async function ComisionesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: rules }, { data: payouts }, { data: pendingTotals }, { data: professionals }] = await Promise.all([
    supabase
      .from("commission_rules")
      .select("id, name, applies_to, professional_id, service_id, rule_type, value_bps_or_cents, priority, is_active, professionals(display_name), services(name)")
      .order("priority"),
    supabase
      .from("commission_payouts")
      .select("id, professional_id, period_start, period_end, total_cents, status, paid_at, professionals(display_name)")
      .order("period_end", { ascending: false })
      .limit(20),
    supabase
      .from("commission_calculations")
      .select("professional_id, commission_cents, professionals(display_name)")
      .eq("status", "pending"),
    supabase.from("professionals").select("id, display_name").eq("is_active", true).order("display_name"),
  ]);

  // Agrupar pending por profesional
  const pendingByProf = new Map<string, { name: string; total: number }>();
  for (const c of pendingTotals ?? []) {
    const name = c.professionals?.display_name ?? "—";
    const cur = pendingByProf.get(c.professional_id) ?? { name, total: 0 };
    cur.total += c.commission_cents;
    pendingByProf.set(c.professional_id, cur);
  }

  return (
    <>
      <PageHeader
        title="Comisiones"
        description="Reglas por servicio o profesional. Cálculo automático al cerrar el turno."
        actions={
          <>
            <GeneratePayoutDialog professionals={professionals ?? []} />
            <NewRuleDialog professionals={professionals ?? []} />
          </>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pendiente · {pendingByProf.size}</TabsTrigger>
            <TabsTrigger value="payouts">Liquidaciones · {payouts?.length ?? 0}</TabsTrigger>
            <TabsTrigger value="rules">Reglas · {rules?.length ?? 0}</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingByProf.size === 0 ? (
              <EmptyState icon={Sparkles} title="Sin comisiones pendientes" description="A medida que cierres turnos, las comisiones aparecerán acá listas para liquidar." />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Array.from(pendingByProf.entries()).map(([profId, { name, total }]) => (
                  <div key={profId} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Pendiente</div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums">{formatCents(total)}</div>
                    <div className="mt-1 text-sm">{name}</div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payouts">
            {(payouts ?? []).length === 0 ? (
              <EmptyState icon={Sparkles} title="Sin liquidaciones todavía" description="Cuando generes la primera, aparecerá acá." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Profesional</th>
                      <th className="px-4 py-3 text-left">Período</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {payouts!.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium">{p.professionals?.display_name ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          {new Date(p.period_start).toLocaleDateString("es-AR")} → {new Date(p.period_end).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatCents(p.total_cents)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={p.status === "paid" ? "success" : p.status === "draft" ? "soft" : "default"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.status !== "paid" && <MarkPaidButton payoutId={p.id} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules">
            {(rules ?? []).length === 0 ? (
              <EmptyState icon={Percent} title="Sin reglas configuradas" description="Sin reglas no se calculan comisiones automáticas." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Aplica a</th>
                      <th className="px-4 py-3 text-left">Profesional</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-center">Prioridad</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rules!.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium">{r.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {r.applies_to}
                          {r.services?.name ? ` · ${r.services.name}` : ""}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.professionals?.display_name ?? "Todos"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {r.rule_type === "percent" ? `${(r.value_bps_or_cents / 100).toFixed(2)}%` : formatCents(r.value_bps_or_cents)}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">{r.priority}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={r.is_active ? "success" : "soft"}>{r.is_active ? "Activa" : "Pausada"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
