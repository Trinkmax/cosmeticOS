import { ArrowUpRight, BarChart3, Calendar, Sparkles, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { formatCents } from "@/lib/utils";
import { RangePicker } from "./range-picker";

type SearchParams = Promise<{ days?: string }>;

export default async function StatsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const { days: daysParam } = await searchParams;
  const days = Math.max(1, Math.min(365, Number(daysParam ?? "30")));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceISO = since.toISOString();
  const sinceDate = since.toISOString().slice(0, 10);
  const todayDate = new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const [{ data: kpis }, { data: appts }, { data: payments }, { data: topServices }] = await Promise.all([
    supabase.rpc("get_dashboard_kpis", { _from: sinceDate, _to: todayDate }),
    supabase
      .from("appointments")
      .select("id, starts_at, status, total_cents, appointment_professionals(professional_id, professionals(display_name))")
      .gte("starts_at", sinceISO),
    supabase
      .from("payments")
      .select("id, amount_cents, occurred_at, kind, status")
      .gte("occurred_at", sinceISO)
      .eq("status", "completed"),
    supabase
      .from("appointment_services")
      .select("service_id, services(name, color), price_cents_snapshot, appointments(starts_at, status)")
      .gte("appointments.starts_at", sinceISO),
  ]);

  const k = (kpis ?? {}) as Record<string, number>;

  // Construir time-series por día
  const dailyRevenue = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyRevenue.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of payments ?? []) {
    if (p.kind === "refund") continue;
    const key = p.occurred_at.slice(0, 10);
    if (dailyRevenue.has(key)) dailyRevenue.set(key, (dailyRevenue.get(key) ?? 0) + p.amount_cents);
  }
  const series = Array.from(dailyRevenue.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, value: val }));
  const maxVal = Math.max(1, ...series.map((s) => s.value));

  // Profesional top
  const profMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const a of appts ?? []) {
    if (a.status !== "completed") continue;
    for (const ap of (a.appointment_professionals as Array<{ professional_id: string; professionals: { display_name: string } | null }>) ?? []) {
      const name = ap.professionals?.display_name ?? "—";
      const cur = profMap.get(ap.professional_id) ?? { name, count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += a.total_cents;
      profMap.set(ap.professional_id, cur);
    }
  }
  const topProfs = Array.from(profMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top servicios (completed only)
  const serviceMap = new Map<string, { name: string; color: string | null; count: number; revenue: number }>();
  for (const s of (topServices ?? []) as Array<{
    service_id: string;
    services: { name: string; color: string | null } | null;
    price_cents_snapshot: number;
    appointments: { status: string } | null;
  }>) {
    if (s.appointments?.status !== "completed") continue;
    const name = s.services?.name ?? "—";
    const cur = serviceMap.get(s.service_id) ?? { name, color: s.services?.color ?? null, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += s.price_cents_snapshot;
    serviceMap.set(s.service_id, cur);
  }
  const topServ = Array.from(serviceMap.values()).sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Estadísticas"
        description={`Últimos ${days} días. Ocupación, ingresos, recurrencia y ranking.`}
        actions={<RangePicker current={days} />}
      />

      <div className="container mx-auto px-4 py-6 md:px-8 space-y-8">
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StaggerItem><KpiCard label="Ingresos" value={formatCents(k.revenue_cents ?? 0)} icon={Wallet} accent="from-blush-300 to-peach-300" /></StaggerItem>
          <StaggerItem><KpiCard label="Turnos" value={String(k.appointments_total ?? 0)} icon={Calendar} accent="from-peach-300 to-blush-200" /></StaggerItem>
          <StaggerItem><KpiCard label="Clientes nuevos" value={String(k.new_clients ?? 0)} icon={Users} accent="from-lavender-300 to-blush-200" /></StaggerItem>
          <StaggerItem><KpiCard label="Ticket promedio" value={formatCents(k.average_ticket_cents ?? 0)} icon={ArrowUpRight} accent="from-blush-200 to-peach-200" /></StaggerItem>
        </Stagger>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-medium tracking-tight">Ingresos por día</h2>
              <p className="text-xs text-muted-foreground">Sin reembolsos. Pico: {formatCents(maxVal)}</p>
            </div>
            <Sparkles className="size-4 text-blush-400" />
          </div>
          <RevenueChart series={series} max={maxVal} />
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="font-medium tracking-tight">Top profesionales</h2>
            {topProfs.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Sin datos en el período.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {topProfs.map((p, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.count} turnos</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{formatCents(p.revenue)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <h2 className="font-medium tracking-tight">Top servicios</h2>
            {topServ.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Sin datos en el período.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {topServ.map((s, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color ?? "#f9b8c1" }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.count} sesiones</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{formatCents(s.revenue)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-medium tracking-tight">Desglose de turnos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <MiniStat label="Completados" value={k.appointments_completed ?? 0} max={k.appointments_total ?? 1} color="bg-emerald-500" />
            <MiniStat label="Pendientes" value={k.appointments_pending ?? 0} max={k.appointments_total ?? 1} color="bg-amber-500" />
            <MiniStat label="Cancelados/no-show" value={k.appointments_cancelled ?? 0} max={k.appointments_total ?? 1} color="bg-rose-500" />
            <MiniStat label="Reembolsos" value={k.refunds_cents ?? 0} max={k.revenue_cents ?? 1} color="bg-purple-500" isMoney />
          </div>
        </section>
      </div>
    </>
  );
}

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: typeof BarChart3; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5">
      <div className={`absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-2xl transition-opacity group-hover:opacity-50`} />
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-2 flex items-end justify-between">
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
          <div className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br ${accent} text-blush-900`}>
            <Icon className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ series, max }: { series: Array<{ date: string; value: number }>; max: number }) {
  if (series.length === 0) return <p className="mt-4 text-sm text-muted-foreground">Sin datos.</p>;
  const width = 800;
  const height = 180;
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const step = innerW / Math.max(1, series.length - 1);
  const points = series.map((s, i) => {
    const x = padding + i * step;
    const y = padding + innerH - (s.value / max) * innerH;
    return [x, y] as const;
  });
  const linePath = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
  const fillPath = `${linePath} L ${padding + innerW} ${padding + innerH} L ${padding} ${padding + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-44 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.76 0.105 15)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.86 0.095 60)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#revenue-fill)" />
      <path d={linePath} stroke="oklch(0.6 0.15 15)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="oklch(0.6 0.15 15)" />
      ))}
    </svg>
  );
}

function MiniStat({ label, value, max, color, isMoney }: { label: string; value: number; max: number; color: string; isMoney?: boolean }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold tabular-nums">{isMoney ? formatCents(value) : value}</div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
