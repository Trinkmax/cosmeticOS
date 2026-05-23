"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
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
    items: [{ href: "/app/mis-comisiones", label: "Mis comisiones", icon: Percent }],
    roles: ["professional"],
  },
  {
    label: "Cuenta",
    items: [{ href: "/app/config", label: "Configuración", icon: Settings }],
    roles: ["owner", "admin"],
  },
];

export function MobileNavButton({ role }: { role: AppRole | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const r = role ?? "reception";
  const groups = ALL_GROUPS.filter((g) => g.roles.includes(r));

  // Cierra el drawer al navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          className="grid size-9 place-items-center rounded-lg border border-border/60 bg-card text-foreground transition-colors hover:bg-blush-50 md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="size-4" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <AnimatePresence>
          {open && (
            <>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content asChild forceMount>
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-sidebar shadow-card outline-none"
                >
                  <DialogPrimitive.Title className="sr-only">Menú</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="sr-only">
                    Navegación principal
                  </DialogPrimitive.Description>

                  <div className="flex h-14 items-center justify-between border-b border-border/60 px-4">
                    <Link
                      href="/app"
                      onClick={() => setOpen(false)}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="cosmeticOS — Ir al dashboard"
                    >
                      <Logo className="h-6 w-auto" />
                    </Link>
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded-md p-1.5 hover:bg-blush-50"
                      aria-label="Cerrar menú"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <nav className="flex-1 overflow-y-auto px-3 pb-6">
                    {groups.map((g) => (
                      <div key={g.label} className="mt-5 first:mt-2">
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
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-colors",
                                    active
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
                                  )}
                                >
                                  <Icon className="size-4" />
                                  <span className="font-medium">{item.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </nav>
                </motion.aside>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
