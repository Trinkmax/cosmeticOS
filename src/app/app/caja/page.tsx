import { ArrowDownToLine, ArrowUpFromLine, Lock, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { formatCents } from "@/lib/utils";
import { OpenSessionButton, CloseSessionDialog, RegisterPaymentDialog } from "./caja-actions";
import { AccountsDialog } from "./accounts-dialog";

export default async function CajaPage() {
  const session = await requireStaff();
  const supabase = await createClient();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const [{ data: accounts }, { data: payments }, { data: openSession }, { data: clients }] = await Promise.all([
    supabase.from("cash_accounts").select("id, name, kind, currency, is_active").order("is_active", { ascending: false }).order("sort_order").order("name"),
    supabase
      .from("payments")
      .select("id, amount_cents, currency, kind, status, notes, occurred_at, account_id, clients(full_name)")
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .eq("status", "completed")
      .order("occurred_at", { ascending: false }),
    supabase
      .from("cash_sessions")
      .select("id, opened_at, opened_by, opening_notes, expected_totals")
      .eq("location_id", session.currentLocationId ?? "")
      .eq("status", "open")
      .maybeSingle(),
    supabase.from("clients").select("id, full_name").eq("is_active", true).order("full_name").limit(500),
  ]);

  const totals = new Map<string, number>();
  for (const p of payments ?? []) {
    const k = p.account_id ?? "—";
    totals.set(k, (totals.get(k) ?? 0) + (p.kind === "refund" ? -p.amount_cents : p.amount_cents));
  }
  const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v, 0);

  return (
    <>
      <PageHeader
        title="Caja"
        description="Movimientos del día. Ledger inmutable: para revertir, registrá un movimiento opuesto."
        actions={
          <>
            <AccountsDialog accounts={accounts ?? []} />
            <RegisterPaymentDialog accounts={(accounts ?? []).filter((a) => a.is_active)} clients={clients ?? []} disabled={!openSession} />
            {openSession ? (
              <CloseSessionDialog session={openSession} accounts={(accounts ?? []).filter((a) => a.is_active)} />
            ) : (
              <OpenSessionButton />
            )}
          </>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8 space-y-6">
        {!openSession && (
          <div className="rounded-2xl border border-peach-200 bg-peach-50 p-4 text-sm">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 size-4 text-peach-700" />
              <div>
                <strong className="text-peach-800">Caja cerrada.</strong>{" "}
                <span className="text-foreground/80">Abrí la caja para empezar a registrar pagos del día.</span>
              </div>
            </div>
          </div>
        )}

        {openSession && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Sesión abierta</div>
                <div className="mt-1 font-semibold tracking-tight tabular-nums">
                  desde {new Date(openSession.opened_at).toLocaleString("es-AR")}
                </div>
                {openSession.opening_notes && (
                  <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{openSession.opening_notes}&rdquo;</p>
                )}
              </div>
              <Badge variant="success">Abierta</Badge>
            </div>
          </div>
        )}

        {accounts && accounts.filter((a) => a.is_active).length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {accounts.filter((a) => a.is_active).map((a) => (
              <div key={a.id} className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card p-4 shadow-soft">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {a.kind === "mercadopago" ? "MercadoPago" : a.kind === "modo" ? "Modo" : a.kind === "cash" ? "Efectivo" : a.kind === "bank" ? "Banco" : a.kind === "card" ? "Tarjeta" : a.kind}
                  </div>
                  <div className="mt-1 line-clamp-1 font-medium tracking-tight">{a.name}</div>
                </div>
                <div className="mt-3 text-xl font-semibold tabular-nums">
                  {formatCents(totals.get(a.id) ?? 0, a.currency ?? "ARS")}
                </div>
              </div>
            ))}
            <div className="flex h-full flex-col justify-between rounded-xl border border-blush-200 bg-gradient-to-br from-blush-50 to-peach-50 p-4 shadow-soft">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-blush-700">Total del día</div>
                <div className="mt-1 line-clamp-1 font-medium tracking-tight text-blush-900">Todas las cuentas</div>
              </div>
              <div className="mt-3 text-xl font-semibold tabular-nums">{formatCents(grandTotal)}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
            No tenés cuentas configuradas. Tocá <strong>Cuentas</strong> arriba para crear la primera (efectivo, MercadoPago, Modo, etc.).
          </div>
        )}

        {!payments || payments.length === 0 ? (
          <EmptyState icon={Wallet} title="Sin movimientos hoy" description="Cuando registres un pago, aparecerá acá." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Hora</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Concepto</th>
                  <th className="px-4 py-3 text-left">Notas</th>
                  <th className="px-4 py-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {new Date(p.occurred_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">{p.clients?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="soft">{p.kind}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.notes ?? ""}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${p.kind === "refund" ? "text-destructive" : ""}`}>
                      <span className="inline-flex items-center gap-1">
                        {p.kind === "refund" ? <ArrowUpFromLine className="size-3" /> : <ArrowDownToLine className="size-3" />}
                        {formatCents(p.amount_cents, p.currency ?? "ARS")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
