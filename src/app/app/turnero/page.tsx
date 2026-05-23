import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { Calendar } from "./calendar";
import { RealtimeRefresher } from "./realtime-refresher";

type SearchParams = Promise<{ date?: string }>;

function parseDate(date: string | undefined): Date {
  if (!date) return new Date();
  const d = new Date(`${date}T12:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function TurneroPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireStaff();
  const { date } = await searchParams;
  const selectedDate = parseDate(date);

  const supabase = await createClient();
  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [{ data: professionals }, { data: rooms }, { data: services }, { data: appointments }] = await Promise.all([
    supabase
      .from("professionals")
      .select("id, display_name, color, avatar_url")
      .eq("is_active", true)
      .order("sort_order")
      .order("display_name"),
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
          "appointment_professionals(professional_id), " +
          "appointment_rooms(room_id)",
      )
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at"),
  ]);

  if (!session.currentLocationId) {
    redirect("/select-tenant");
  }

  return (
    <>
      {(professionals ?? []).length === 0 ? (
        <div className="container mx-auto px-4 py-12 md:px-8">
          <EmptyState
            icon={CalendarDays}
            title="Sumá profesionales primero"
            description="El turnero necesita al menos un profesional para mostrar la grilla."
            action={
              <Button asChild variant="brand" size="sm">
                <a href="/app/equipo">Ir a Equipo</a>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <RealtimeRefresher />
          <Calendar
            date={selectedDate.toISOString()}
            professionals={professionals ?? []}
            rooms={rooms ?? []}
            services={services ?? []}
            appointments={(appointments ?? []) as never}
          />
        </>
      )}
    </>
  );
}
