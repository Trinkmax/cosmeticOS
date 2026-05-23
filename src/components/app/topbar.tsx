"use client";

import Link from "next/link";
import { Bell, Building2, Check, ChevronDown, LogOut, MoonStar, Search, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { AppRole } from "@/lib/auth/session";
import { MobileNavButton } from "./mobile-nav";

type Props = {
  user: {
    fullName: string;
    email: string;
  };
  tenants: Array<{ id: string; slug: string; name: string; role: AppRole }>;
  currentTenantId: string;
  locations: Array<{ id: string; name: string }>;
  currentLocationId: string | null;
  role: AppRole | null;
  switchTenant: (tenantId: string) => Promise<void>;
  switchLocation: (locationId: string) => Promise<void>;
};

export function Topbar({
  user,
  tenants,
  currentTenantId,
  locations,
  currentLocationId,
  role,
  switchTenant,
  switchLocation,
}: Props) {
  const { theme, setTheme } = useTheme();
  const currentTenant = tenants.find((t) => t.id === currentTenantId);
  const currentLocation = locations.find((l) => l.id === currentLocationId);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-xl md:h-16 md:gap-3 md:px-6">
      {/* Mobile menu burger */}
      <MobileNavButton role={role} />

      {/* Tenant switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 gap-2 px-2 font-medium">
            <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-blush-400 to-peach-400 text-white text-[10px] font-semibold">
              {initials(currentTenant?.name ?? "—")}
            </span>
            <span className="hidden max-w-[160px] truncate md:inline">{currentTenant?.name ?? "Cuenta"}</span>
            <ChevronDown className="size-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Tus cuentas</DropdownMenuLabel>
          {tenants.map((t) => (
            <form key={t.id} action={switchTenant.bind(null, t.id)}>
              <DropdownMenuItem asChild>
                <button type="submit" className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    <span>{t.name}</span>
                  </div>
                  {t.id === currentTenantId && <Check className="size-3.5 text-emerald-500" />}
                </button>
              </DropdownMenuItem>
            </form>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/onboarding">Crear nueva cuenta</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location switcher */}
      {locations.length > 1 && (
        <>
          <span className="hidden text-muted-foreground md:inline">/</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden h-9 gap-1.5 px-2 font-normal md:inline-flex">
                <span className="max-w-[140px] truncate">{currentLocation?.name ?? "Sucursal"}</span>
                <ChevronDown className="size-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Sucursales</DropdownMenuLabel>
              {locations.map((l) => (
                <form key={l.id} action={switchLocation.bind(null, l.id)}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="flex w-full items-center justify-between">
                      {l.name}
                      {l.id === currentLocationId && <Check className="size-3.5 text-emerald-500" />}
                    </button>
                  </DropdownMenuItem>
                </form>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* Search (desktop only) */}
      <div className="ml-auto hidden md:block">
        <button className="group flex h-9 w-72 items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-card hover:border-border">
          <Search className="size-4" />
          <span>Buscar cliente, turno, servicio…</span>
          <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Search button mobile */}
      <Button variant="ghost" size="icon" className="ml-auto size-9 md:hidden">
        <Search className="size-4" />
      </Button>

      <Button variant="ghost" size="icon" className="relative size-9">
        <Bell className="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-8">
              <AvatarFallback>{initials(user.fullName || user.email)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{user.fullName || "Usuaria"}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Location switcher en mobile via menu */}
          {locations.length > 1 && (
            <div className="md:hidden">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Sucursal</DropdownMenuLabel>
              {locations.map((l) => (
                <form key={l.id} action={switchLocation.bind(null, l.id)}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="flex w-full items-center justify-between">
                      {l.name}
                      {l.id === currentLocationId && <Check className="size-3.5 text-emerald-500" />}
                    </button>
                  </DropdownMenuItem>
                </form>
              ))}
              <DropdownMenuSeparator />
            </div>
          )}

          <DropdownMenuItem asChild>
            <Link href="/app/config/perfil">
              <User className="size-4" /> Mi perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/app/config">
              <Settings className="size-4" /> Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
            Tema {theme === "dark" ? "claro" : "oscuro"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/logout">
              <LogOut className="size-4" /> Cerrar sesión
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
