import Link from "next/link";
import { Building2, ChevronRight, Palette, Settings, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { requireAdmin } from "@/lib/auth/session";

const sections = [
  {
    href: "/app/config/sucursales",
    icon: Building2,
    title: "Sucursales",
    desc: "Locales con horario, dirección, teléfono.",
  },
  {
    href: "/app/config/miembros",
    icon: Users,
    title: "Miembros",
    desc: "Quién entra a la cuenta y qué puede hacer.",
  },
  {
    href: "/app/config/branding",
    icon: Palette,
    title: "Branding",
    desc: "Logo, colores, link público de reservas.",
  },
  {
    href: "/app/config/cuenta",
    icon: Settings,
    title: "Cuenta",
    desc: "Nombre del negocio, plan, facturación.",
  },
];

export default async function ConfigPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Configuración" description="Todo lo que define cómo trabaja tu negocio." />
      <div className="container mx-auto px-4 py-6 md:px-8">
        <ul className="grid gap-3 md:grid-cols-2">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:border-primary/40 hover:shadow-card hover:-translate-y-0.5"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <s.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
