import { DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { RoomsGrid } from "./rooms-grid";

export default async function CabinasPage() {
  await requireStaff();
  const supabase = await createClient();
  const [{ data: locations }, { data: rooms }] = await Promise.all([
    supabase.from("locations").select("id, name").eq("is_active", true).order("name"),
    supabase
      .from("rooms")
      .select("id, name, color, description, is_active, location_id")
      .order("sort_order")
      .order("name"),
  ]);

  return (
    <>
      <PageHeader
        title="Cabinas"
        description="Las salas se reservan junto con el profesional. Tocá una para editar."
      />
      <div className="container mx-auto px-4 py-6 md:px-8">
        {(rooms ?? []).length === 0 && (locations ?? []).length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title="Sin sucursales todavía"
            description="Primero creá una sucursal en Configuración."
          />
        ) : (
          <RoomsGrid locations={locations ?? []} rooms={rooms ?? []} />
        )}
      </div>
    </>
  );
}
