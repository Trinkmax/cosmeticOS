import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { switchTenantAction } from "./actions";

export default async function SelectTenantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.tenants.length === 0) redirect("/onboarding");
  if (session.tenants.length === 1) {
    await switchTenantAction(session.tenants[0]!.id);
    redirect("/app");
  }

  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Elegí tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Estás en {session.tenants.length} cuentas. ¿Con cuál querés entrar?
        </p>
      </div>

      <div className="mt-8 space-y-2">
        {session.tenants.map((t) => (
          <form key={t.id} action={switchTenantAction.bind(null, t.id)}>
            <button
              type="submit"
              className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role === "owner" ? "Dueña" : t.role === "admin" ? "Admin" : t.role}
                  </div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </button>
          </form>
        ))}
      </div>

      <div className="mt-6">
        <Button asChild variant="outline" className="w-full">
          <Link href="/onboarding">
            <Plus />
            Crear otra cuenta
          </Link>
        </Button>
      </div>
    </div>
  );
}
