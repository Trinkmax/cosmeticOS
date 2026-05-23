"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn, formatCents } from "@/lib/utils";
import { createPackageAction, updatePackageAction, deletePackageAction } from "./actions";

type Service = {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
  service_categories?: { name: string | null } | null;
};

type Pkg = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  validity_days: number | null;
  color: string | null;
  is_active: boolean;
  package_services: Array<{ service_id: string; sessions_included: number; services?: { name: string } | null }>;
};

const PALETTE = ["#f9b8c1", "#fbc592", "#fde2a7", "#c9e4d4", "#bdd4f0", "#d8c4eb"];

export function PackagesGrid({ packages, services }: { packages: Pkg[]; services: Service[] }) {
  const [open, setOpen] = useState<{ kind: "new" } | { kind: "edit"; pkg: Pkg } | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button variant="brand" onClick={() => setOpen({ kind: "new" })}>
          <Plus />
          Nuevo paquete
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Sin paquetes. Creá el primero.</p>
        </div>
      ) : (
        <Stagger className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => (
            <StaggerItem key={p.id}>
              <PackageCard pkg={p} onClick={() => setOpen({ kind: "edit", pkg: p })} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <AnimatePresence>
        {open && (
          <PackageDialog
            mode={open.kind}
            pkg={open.kind === "edit" ? open.pkg : null}
            services={services}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PackageCard({ pkg, onClick }: { pkg: Pkg; onClick: () => void }) {
  const totalSessions = pkg.package_services.reduce((sum, it) => sum + it.sessions_included, 0);
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full w-full flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 text-left shadow-soft transition-all hover:border-blush-300/60 hover:shadow-card hover:-translate-y-0.5"
    >
      <div
        className="absolute -right-12 -top-12 size-32 rounded-full opacity-20 blur-2xl"
        style={{ background: pkg.color ?? "#f9b8c1" }}
      />
      <div className="relative flex w-full items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 font-medium tracking-tight">{pkg.name}</div>
          {pkg.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{pkg.description}</p>
          )}
        </div>
        {!pkg.is_active && <Badge variant="soft" className="shrink-0 text-[10px]">Pausado</Badge>}
      </div>

      <div className="relative flex w-full items-baseline gap-2">
        <div className="text-2xl font-semibold tabular-nums">{formatCents(pkg.price_cents)}</div>
        {pkg.validity_days && (
          <span className="text-xs text-muted-foreground">· vence {pkg.validity_days}d</span>
        )}
      </div>

      <div className="relative mt-auto flex flex-wrap gap-1">
        <Badge variant="default" className="text-[10px]">{totalSessions} sesiones</Badge>
        {pkg.package_services.slice(0, 2).map((it, i) => (
          <Badge key={i} variant="soft" className="text-[10px]">
            {it.sessions_included}× {it.services?.name ?? "?"}
          </Badge>
        ))}
        {pkg.package_services.length > 2 && (
          <Badge variant="soft" className="text-[10px]">+{pkg.package_services.length - 2}</Badge>
        )}
      </div>
    </button>
  );
}

function PackageDialog({
  mode,
  pkg,
  services,
  onClose,
}: {
  mode: "new" | "edit";
  pkg: Pkg | null;
  services: Service[];
  onClose: () => void;
}) {
  const [name, setName] = useState(pkg?.name ?? "");
  const [description, setDescription] = useState(pkg?.description ?? "");
  const [price, setPrice] = useState(String(pkg?.price_cents ?? ""));
  const [validity, setValidity] = useState(pkg?.validity_days ? String(pkg.validity_days) : "90");
  const [color, setColor] = useState(pkg?.color ?? PALETTE[0]!);
  const [items, setItems] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    pkg?.package_services?.forEach((it) => {
      init[it.service_id] = it.sessions_included;
    });
    return init;
  });
  const [pending, startTransition] = useTransition();

  const totalRetail = useMemo(
    () => Object.entries(items).reduce((s, [sid, qty]) => {
      const x = services.find((y) => y.id === sid);
      return s + (x?.price_cents ?? 0) * qty;
    }, 0),
    [items, services],
  );
  const totalItems = Object.values(items).reduce((a, b) => a + b, 0);
  const discount = totalRetail > 0 && price ? Math.round((1 - Number(price) / totalRetail) * 100) : 0;

  function add(sid: string) {
    setItems((p) => ({ ...p, [sid]: (p[sid] ?? 0) + 1 }));
  }
  function sub(sid: string) {
    setItems((p) => {
      const n = { ...p };
      const v = (n[sid] ?? 0) - 1;
      if (v <= 0) delete n[sid];
      else n[sid] = v;
      return n;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalItems === 0) { toast.error("Agregá al menos un servicio."); return; }
    if (!price || Number(price) <= 0) { toast.error("Definí un precio."); return; }

    startTransition(async () => {
      const payload = {
        name,
        description: description || null,
        price_cents: Math.round(Number(price)),
        validity_days: validity ? Number(validity) : null,
        color,
        items: Object.entries(items).map(([service_id, sessions_included]) => ({ service_id, sessions_included })),
      };
      const r = mode === "edit" && pkg
        ? await updatePackageAction(pkg.id, payload)
        : await createPackageAction(payload);
      if (r.ok) {
        toast.success(mode === "edit" ? "Paquete actualizado" : "Paquete creado");
        onClose();
      } else toast.error(r.error);
    });
  }

  function handleDelete() {
    if (!pkg) return;
    if (!confirm(`¿Eliminar "${pkg.name}"?\n\nSi tiene ventas asociadas, se pausa.`)) return;
    startTransition(async () => {
      const r = await deletePackageAction(pkg.id);
      if (r.ok) {
        toast.success("Paquete eliminado");
        onClose();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nuevo paquete" : pkg?.name}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Editá los datos o eliminalo. Las ventas existentes no se afectan." : "Configurá un combo prepago."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Pack 10 sesiones depilación" />
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Lo que ven los clientes al comprar" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Precio (ARS)</Label>
              <Input type="number" min="0" step="100" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150000" />
              {discount > 0 && totalRetail > 0 && (
                <p className="text-xs text-emerald-700">Ahorrás {discount}% vs. precio a la carta.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Validez (días)</Label>
              <Input type="number" min="1" value={validity} onChange={(e) => setValidity(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-8 rounded-full transition-transform",
                    c === color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Servicios incluidos</Label>
              {totalItems > 0 && (
                <div className="text-xs text-muted-foreground">
                  {totalItems} sesiones · {formatCents(totalRetail)} a la carta
                </div>
              )}
            </div>
            <ul className="max-h-64 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/60 bg-card">
              {services.map((s) => {
                const qty = items[s.id] ?? 0;
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.service_categories?.name ?? "—"} · {formatCents(s.price_cents)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="size-7" onClick={() => sub(s.id)} disabled={qty === 0}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
                      <Button type="button" variant="outline" size="icon" className="size-7" onClick={() => add(s.id)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <DialogFooter className="flex flex-row-reverse items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="brand" loading={pending}>
                <Save />
                Guardar
              </Button>
            </div>
            {mode === "edit" && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
                <Trash2 className="text-destructive" />
                <span className="text-destructive">Eliminar</span>
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
