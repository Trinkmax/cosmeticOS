import { Ticket } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { PackagesGrid } from "./packages-grid";

export default async function PaquetesPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: packages }, { data: services }] = await Promise.all([
    supabase
      .from("packages")
      .select("id, name, description, price_cents, validity_days, color, is_active, package_services(service_id, sessions_included, services(name))")
      .order("sort_order")
      .order("name"),
    supabase
      .from("services")
      .select("id, name, price_cents, duration_minutes, category_id, service_categories(name)")
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <>
      <PageHeader
        title="Paquetes y bonos"
        description="Venta de sesiones por adelantado. Se descuentan automáticamente al cerrar el turno."
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {(packages ?? []).length === 0 && (services ?? []).length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="Cargá servicios antes"
            description="Los paquetes combinan servicios. Empezá creando los servicios y volvé."
          />
        ) : (
          <PackagesGrid packages={(packages ?? []) as never} services={services ?? []} />
        )}
      </div>
    </>
  );
}
