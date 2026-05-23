import { Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { ClientsList } from "./clients-list";

type SearchParams = Promise<{ q?: string }>;

export default async function ClientesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireTenant();
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, phone_e164, email, tags, birth_date, gender, dni, notes, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Tu base de datos. Buscalos por nombre, teléfono o email."
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {!clients || clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Todavía no tenés clientes"
            description="Cuando agendes el primer turno, el cliente se carga solo. O cargalo manualmente."
          />
        ) : (
          <ClientsList clients={clients} initialQuery={q ?? ""} />
        )}
      </div>
    </>
  );
}
