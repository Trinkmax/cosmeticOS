import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Plus, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem, FadeIn } from "@/components/motion/primitives";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/utils";

export function AdminDashboard({ userEmail }: { userEmail: string }) {
  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              ¡Hola, {userEmail.split("@")[0]}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Esto es lo que pasó hoy en tu local.
            </p>
          </div>
          <Button asChild variant="brand">
            <Link href="/app/turnero">
              <Plus />
              Nuevo turno
            </Link>
          </Button>
        </div>
      </FadeIn>

      <Suspense fallback={<KpiSkeleton />}>
        <KpiCards />
      </Suspense>

      <Suspense fallback={<TodaySkeleton />}>
        <TodaySection />
      </Suspense>
    </div>
  );
}

async function KpiCards() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_dashboard_kpis", {});
  const kpis = (data ?? {}) as Record<string, number>;

  const cards = [
    {
      label: "Turnos hoy",
      value: kpis.appointments_total ?? 0,
      icon: CalendarDays,
      href: "/app/turnero",
      color: "from-blush-300 to-blush-400",
    },
    {
      label: "Ingresos",
      value: formatCents(kpis.revenue_cents ?? 0),
      icon: Wallet,
      href: "/app/caja",
      color: "from-emerald-400 to-emerald-500",
    },
    {
      label: "Clientes nuevos",
      value: kpis.new_clients ?? 0,
      icon: Users,
      href: "/app/clientes",
      color: "from-peach-300 to-peach-400",
    },
    {
      label: "Ticket promedio",
      value: formatCents(kpis.average_ticket_cents ?? 0),
      icon: ArrowUpRight,
      href: "/app/stats",
      color: "from-lavender-300 to-blush-300",
    },
  ];

  return (
    <Stagger className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <StaggerItem key={c.label}>
            <Link
              href={c.href}
              className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5"
            >
              <div className={`absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-30`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                    {c.value}
                  </div>
                </div>
                <div className={`grid size-9 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-blush-900 shadow-md`}>
                  <Icon className="size-4" />
                </div>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

async function TodaySection() {
  const supabase = await createClient();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data: appointments } = await supabase
    .from("v_daily_agenda")
    .select("*")
    .gte("starts_at", startOfDay)
    .lt("starts_at", endOfDay)
    .order("starts_at")
    .limit(8);

  return (
    <FadeIn delay={0.15} className="mt-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Próximos turnos</h2>
          <p className="text-sm text-muted-foreground">Lo que viene en las próximas horas.</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/turnero">Ver agenda completa →</Link>
        </Button>
      </div>

      {!appointments || appointments.length === 0 ? (
        <EmptyToday />
      ) : (
        <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {appointments.map((a) => (
            <li key={a.id} className="flex items-center gap-4 px-5 py-4">
              <div className="text-sm tabular-nums">
                <div className="font-medium">
                  {new Date(a.starts_at!).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(
                    (new Date(a.ends_at!).getTime() - new Date(a.starts_at!).getTime()) / 60000,
                  )}{" "}
                  min
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{a.display_name ?? "Sin nombre"}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {(a.services as Array<{ name: string }> | null)
                    ?.map((s) => s.name)
                    .join(", ") ?? "Sin servicios"}
                </div>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground md:block">
                {a.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </FadeIn>
  );
}

function EmptyToday() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
        <CalendarDays className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-medium">No hay turnos por ahora</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Creá tu primer turno o cargá tus servicios y profesionales.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Button asChild size="sm" variant="brand">
          <Link href="/app/turnero">Nuevo turno</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/app/servicios">Cargar servicios</Link>
        </Button>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="mt-10">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-4 h-64 rounded-2xl" />
    </div>
  );
}
