"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Users,
  Sparkles,
  UserCog,
  DoorOpen,
  Ticket,
  Wallet,
  Package,
  Percent,
  BarChart3,
  MessageCircle,
  Settings,
  LayoutDashboard,
  CalendarHeart,
  Star,
} from "lucide-react";
import { motion, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/lib/auth/session";
import { Logo } from "./logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof CalendarDays;
};

type NavGroup = {
  label: string;
  items: NavItem[];
  roles: AppRole[];
};

const ALL_GROUPS: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/turnero", label: "Turnero", icon: CalendarDays },
      { href: "/app/clientes", label: "Clientes", icon: Users },
      { href: "/app/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
    roles: ["owner", "admin", "reception", "advisor"],
  },
  {
    label: "Mi día",
    items: [
      { href: "/app", label: "Inicio", icon: LayoutDashboard },
      { href: "/app/mi-agenda", label: "Mi agenda", icon: CalendarHeart },
      { href: "/app/clientes", label: "Mis clientes", icon: Users },
      { href: "/app/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
    roles: ["professional"],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/app/servicios", label: "Servicios", icon: Sparkles },
      { href: "/app/paquetes", label: "Paquetes", icon: Ticket },
      { href: "/app/stock", label: "Stock", icon: Package },
    ],
    roles: ["owner", "admin", "reception"],
  },
  {
    label: "Recursos",
    items: [
      { href: "/app/equipo", label: "Equipo", icon: UserCog },
      { href: "/app/cabinas", label: "Cabinas", icon: DoorOpen },
    ],
    roles: ["owner", "admin", "reception"],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/app/caja", label: "Caja", icon: Wallet },
      { href: "/app/comisiones", label: "Comisiones", icon: Percent },
      { href: "/app/stats", label: "Estadísticas", icon: BarChart3 },
    ],
    roles: ["owner", "admin"],
  },
  {
    label: "Comisiones",
    items: [
      { href: "/app/mis-comisiones", label: "Mis comisiones", icon: Percent },
    ],
    roles: ["professional"],
  },
  {
    label: "Cuenta",
    items: [{ href: "/app/config", label: "Configuración", icon: Settings }],
    roles: ["owner", "admin"],
  },
];

export function Sidebar({ role }: { role: AppRole | null }) {
  const pathname = usePathname();
  const r = role ?? "reception";

  const groups = ALL_GROUPS.filter((g) => g.roles.includes(r));

  return (
    <aside className="hidden h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar md:flex">
      <Link
        href="/app"
        className="flex h-16 items-center px-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="cosmeticOS — Ir al dashboard"
      >
        <Logo priority className="h-6 w-auto" />
      </Link>

      <LayoutGroup>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {groups.map((g) => (
            <div key={g.label} className="mt-5 first:mt-0">
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {g.label}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const active =
                    item.href === "/app"
                      ? pathname === "/app"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-lg bg-sidebar-primary shadow-sm"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                        <Icon className="relative size-4" />
                        <span className="relative font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </LayoutGroup>

      <div className="border-t border-sidebar-border/60 px-5 py-3 text-[10px] text-sidebar-foreground/40">
        v0.1 · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
