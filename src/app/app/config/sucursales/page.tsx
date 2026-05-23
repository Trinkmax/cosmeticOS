import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { NewLocationDialog } from "./location-dialog";
import { LocationsGrid } from "./locations-grid";

export default async function SucursalesPage() {
  const session = await requireAdmin();
  const supabase = await createClient();

  const [{ data: locations }, { data: tenant }] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name, slug, address, city, province, timezone, phone_e164, email, is_active, is_default, opening_hours")
      .order("is_default", { ascending: false })
      .order("name"),
    supabase.from("tenants").select("timezone").eq("id", session.currentTenantId).maybeSingle(),
  ]);

  return (
    <>
      <PageHeader
        title="Sucursales"
        description="Locales con horario, dirección y teléfono. Tocá una para editar."
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/config">
                <ArrowLeft />
                Volver
              </Link>
            </Button>
            <NewLocationDialog defaultTimezone={tenant?.timezone ?? "America/Argentina/Buenos_Aires"} />
          </>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {(locations ?? []).length === 0 ? (
          <EmptyState icon={Building2} title="Sin sucursales todavía" />
        ) : (
          <LocationsGrid locations={locations ?? []} />
        )}
      </div>
    </>
  );
}
