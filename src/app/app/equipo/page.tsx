import { UserCog } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { TeamGrid } from "./team-grid";

export default async function EquipoPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, display_name, email, phone_e164, color, avatar_url, is_active, online_bookable, bio")
    .order("display_name");

  return (
    <>
      <PageHeader
        title="Equipo"
        description="Profesionales que atienden. Tocá una tarjeta para editar."
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {(professionals ?? []).length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Sumá a tu equipo"
            description="Cargá tus profesionales para empezar a agendar."
          />
        ) : (
          <TeamGrid professionals={professionals!} />
        )}
      </div>
    </>
  );
}
