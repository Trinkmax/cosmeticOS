import Link from "next/link";
import { ArrowRight, CalendarHeart, Clock, Percent, Sparkles, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem, FadeIn } from "@/components/motion/primitives";
import { createClient } from "@/lib/supabase/server";
import { formatCents, initials } from "@/lib/utils";

export async function ProfessionalDashboard({
  userId,
  tenantId,
  userEmail,
}: {
  userId: string;
  tenantId: string;
  userEmail: string;
}) {
  const supabase = await createClient();

  // 1) Profile del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  // 2) member_id + professional vinculado
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .single();

  const { data: prof } = member
    ? await supabase
        .from("professionals")
        .select("id, display_name, color")
        .eq("member_id", member.id)
        .maybeSingle()
    : { data: null };

  // Si no está vinculada a un profesional, mostrar mensaje
  if (!prof) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-8">
        <FadeIn>
          <div className="rounded-2xl border border-peach-200 bg-peach-50 p-6 text-center">
            <Sparkles className="mx-auto size-8 text-peach-600" />
            <h2 className="mt-3 text-lg font-semibold tracking-tight">¡Hola, {profile?.full_name ?? userEmail.split("@")[0]}!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Tu cuenta todavía no está vinculada a un profesional. Pedile a quien administre la cuenta que te vincule desde <strong>Equipo</strong>.
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  // 3) Turnos de hoy
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  type ApptRow = {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    total_cents: number;
    walk_in_name: string | null;
    clients: { full_name: string; phone_e164: string | null } | null;
    appointment_services: Array<{ services: { name: string; color: string | null } | null }>;
  };

  const { data: todayApptsRaw } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, total_cents, walk_in_name, clients(full_name, phone_e164), " +
      "appointment_services(services(name, color)), appointment_professionals!inner(professional_id)",
    )
    .eq("appointment_professionals.professional_id", prof.id)
    .gte("starts_at", startOfDay)
    .lt("starts_at", endOfDay)
    .order("starts_at");
  const todayAppts = (todayApptsRaw ?? []) as unknown as ApptRow[];

  // 4) Próximos turnos (después de hoy, próximos 7 días, primeros 5)
  const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: upcomingApptsRaw } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, total_cents, walk_in_name, clients(full_name, phone_e164), " +
      "appointment_services(services(name, color)), appointment_professionals!inner(professional_id)",
    )
    .eq("appointment_professionals.professional_id", prof.id)
    .gte("starts_at", endOfDay)
    .lt("starts_at", in7days)
    .in("status", ["pending", "confirmed"])
    .order("starts_at")
    .limit(5);
  const upcomingAppts = (upcomingApptsRaw ?? []) as unknown as ApptRow[];

  // 5) Stats del mes
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const { data: monthApptsRaw } = await supabase
    .from("appointments")
    .select("id, status, total_cents, appointment_professionals!inner(professional_id)")
    .eq("appointment_professionals.professional_id", prof.id)
    .gte("starts_at", startOfMonth);
  const monthAppts = (monthApptsRaw ?? []) as unknown as Array<{ id: string; status: string; total_cents: number }>;

  const completed = monthAppts.filter((a) => a.status === "completed");
  const monthRevenue = completed.reduce((s, a) => s + (a.total_cents ?? 0), 0);

  // 6) Comisiones pendientes
  const { data: pendingComm } = await supabase
    .from("commission_calculations")
    .select("commission_cents")
    .eq("professional_id", prof.id)
    .eq("status", "pending");
  const pendingCommTotal = (pendingComm ?? []).reduce((s, c) => s + c.commission_cents, 0);

  const todayActive = todayAppts.filter((a) => a.status !== "cancelled" && a.status !== "no_show");
  const nextAppt = todayActive.find((a) => new Date(a.starts_at) >= today) ?? todayActive[0];

  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      <FadeIn>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback style={{ background: prof.color ?? "#8b5cf6", color: "white" }}>
                {initials(prof.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                ¡Hola, {prof.display_name.split(" ")[0]}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {todayActive.length === 0
                  ? "No tenés turnos para hoy. ¡A descansar!"
                  : todayActive.length === 1
                    ? "Tenés 1 turno hoy."
                    : `Tenés ${todayActive.length} turnos hoy.`}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/app/mi-agenda">
              <CalendarHeart />
              Ver mi agenda
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Próximo turno destacado */}
      {nextAppt && (
        <FadeIn delay={0.1} className="mt-8">
          <div className="relative overflow-hidden rounded-2xl border border-blush-200 bg-gradient-to-br from-blush-50 via-peach-50/60 to-cream-50 p-6 shadow-card">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-blush-300 to-peach-300 opacity-25 blur-3xl" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-blush-700">Próximo turno</div>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <div className="text-3xl font-semibold tabular-nums tracking-tight">
                  {new Date(nextAppt.starts_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-sm text-muted-foreground tabular-nums">
                  → {new Date(nextAppt.ends_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <Badge variant={nextAppt.status === "confirmed" ? "success" : "warning"}>
                  {nextAppt.status === "confirmed" ? "Confirmado" : nextAppt.status === "pending" ? "Pendiente" : nextAppt.status}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-medium tracking-tight">
                  {nextAppt.clients?.full_name ?? nextAppt.walk_in_name ?? "Sin nombre"}
                </span>
              </div>
              <div className="mt-1 ml-6 text-sm text-muted-foreground">
                {(nextAppt.appointment_services as Array<{ services: { name: string } | null }> | null)
                  ?.map((s) => s.services?.name)
                  .filter(Boolean)
                  .join(" · ") || "Sin servicios"}
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* KPIs */}
      <Stagger className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Hoy"
            value={String(todayActive.length)}
            sub="turnos activos"
            icon={CalendarHeart}
            accent="from-blush-300 to-peach-300"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Este mes"
            value={String(completed.length)}
            sub="completados"
            icon={Sparkles}
            accent="from-emerald-300 to-emerald-400"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Generado"
            value={formatCents(monthRevenue)}
            sub="en el mes"
            icon={Sparkles}
            accent="from-peach-300 to-blush-300"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Comisión"
            value={formatCents(pendingCommTotal)}
            sub="pendiente"
            icon={Percent}
            accent="from-lavender-300 to-blush-300"
            href="/app/mis-comisiones"
          />
        </StaggerItem>
      </Stagger>

      {/* Turnos del día */}
      <FadeIn delay={0.2} className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Tus turnos de hoy</h2>
            <p className="text-sm text-muted-foreground">
              {today.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/mi-agenda">Ver agenda completa →</Link>
          </Button>
        </div>

        {todayActive.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
            <Clock className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Sin turnos para hoy.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
            {todayActive.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                <div className="text-sm tabular-nums">
                  <div className="font-medium">
                    {new Date(a.starts_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000)}min
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium tracking-tight">
                    {a.clients?.full_name ?? a.walk_in_name ?? "Sin nombre"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.appointment_services
                      .map((s) => s.services?.name)
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </div>
                </div>
                <Badge
                  variant={a.status === "completed" ? "success" : a.status === "in_progress" ? "success" : a.status === "pending" ? "warning" : "soft"}
                  className="text-[10px]"
                >
                  {a.status === "confirmed" ? "Confirmado" : a.status === "in_progress" ? "En curso" : a.status === "completed" ? "Completado" : a.status === "pending" ? "Pendiente" : a.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </FadeIn>

      {/* Próximos turnos (7 días) */}
      {upcomingAppts.length > 0 && (
        <FadeIn delay={0.3} className="mt-10">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Próximos días</h2>
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
            {upcomingAppts.map((a) => {
              const d = new Date(a.starts_at);
              return (
                <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="text-sm tabular-nums">
                    <div className="font-medium first-letter:uppercase">
                      {d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium tracking-tight">
                      {a.clients?.full_name ?? a.walk_in_name ?? "Sin nombre"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {(a.appointment_services as Array<{ services: { name: string } | null }> | null)
                        ?.map((s) => s.services?.name)
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </li>
              );
            })}
          </ul>
        </FadeIn>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof CalendarHeart;
  accent: string;
  href?: string;
}) {
  const inner = (
    <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5">
      <div className={`absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>
        </div>
        <div className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br ${accent} text-blush-900 shadow-md`}>
          <Icon className="size-3.5" />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
