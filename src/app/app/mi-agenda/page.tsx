import { CalendarHeart } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireTenant, isProfessional } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Calendar } from "../turnero/calendar";
import { RealtimeRefresher } from "../turnero/realtime-refresher";

type SearchParams = Promise<{ date?: string }>;

function parseDate(date: string | undefined): Date {
  if (!date) return new Date();
  const d = new Date(`${date}T12:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function MiAgendaPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireTenant();
  if (!isProfessional(session)) redirect("/app/turnero");

  const { date } = await searchParams;
  const selectedDate = parseDate(date);

  const supabase = await createClient();

  // Encontrar el professional vinculado a este user
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("tenant_id", session.currentTenantId)
    .single();

  const { data: prof } = member
    ? await supabase
        .from("professionals")
        .select("id, display_name, color, avatar_url")
        .eq("member_id", member.id)
        .maybeSingle()
    : { data: null };

  if (!prof) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-8">
        <EmptyState
          icon={CalendarHeart}
          title="Tu cuenta no está vinculada a un profesional"
          description="Pedile a quien administre la cuenta que te vincule desde Equipo."
        />
      </div>
    );
  }

  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [{ data: rooms }, { data: services }, { data: appointments }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, name, color")
      .eq("is_active", true)
      .eq("location_id", session.currentLocationId ?? "")
      .order("sort_order"),
    supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents, color, category_id")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("appointments")
      .select(
        "id, starts_at, ends_at, status, notes, total_cents, client_id, walk_in_name, " +
          "clients(id, full_name, phone_e164), " +
          "appointment_services(service_id, services(name, color, duration_minutes)), " +
          "appointment_professionals!inner(professional_id), " +
          "appointment_rooms(room_id)",
      )
      .eq("appointment_professionals.professional_id", prof.id)
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at"),
  ]);

  return (
    <>
      <RealtimeRefresher />
      <Calendar
        date={selectedDate.toISOString()}
        professionals={[prof]}
        rooms={rooms ?? []}
        services={services ?? []}
        appointments={(appointments ?? []) as never}
      />
    </>
  );
}
