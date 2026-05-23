import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/session";
import { CategoryDialog } from "./category-dialog";
import { ServicesGrid } from "./services-grid";

export default async function ServiciosPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, name, color, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("services")
      .select("id, name, description, duration_minutes, price_cents, color, is_active, category_id, requires_consent, requires_room, online_bookable")
      .order("sort_order")
      .order("name"),
  ]);

  const cats = categories ?? [];
  const svcs = services ?? [];

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Tu catálogo. Categorías, duración, precio y reglas por servicio."
        actions={<CategoryDialog />}
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {svcs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Cargá tus primeros servicios"
            description="Definí qué hacés, cuánto dura y cuánto cuesta. Después podrás agendarlos."
          />
        ) : (
          <ServicesGrid categories={cats} services={svcs} />
        )}
      </div>
    </>
  );
}
