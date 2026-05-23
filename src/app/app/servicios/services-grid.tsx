"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Clock, Plus, Save, Tag, Trash2 } from "lucide-react";
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
import { createServiceAction, deleteServiceAction, updateServiceAction } from "./actions";

type Category = { id: string; name: string; color: string };
type Service = {
  id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price_cents: number;
  color: string | null;
  is_active: boolean;
  category_id: string | null;
  requires_consent: boolean;
  requires_room: boolean;
  online_bookable?: boolean;
};

type DialogState = null | { kind: "new" } | { kind: "edit"; service: Service };

const PALETTE = ["#f472b6", "#fb7185", "#fbc592", "#fde2a7", "#a3e635", "#c9e4d4", "#bdd4f0", "#d8c4eb", "#c084fc", "#94a3b8"];

export function ServicesGrid({
  categories,
  services,
}: {
  categories: Category[];
  services: Service[];
}) {
  const [dialog, setDialog] = useState<DialogState>(null);

  const grouped = new Map<string | null, Service[]>();
  for (const s of services) {
    const k = s.category_id ?? null;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(s);
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button variant="brand" onClick={() => setDialog({ kind: "new" })}>
          <Plus />
          Nuevo servicio
        </Button>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const items = grouped.get(cat.id) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={cat.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.name}
                </h2>
                <span className="text-xs text-muted-foreground">· {items.length}</span>
              </div>
              <Stagger className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((s) => (
                  <StaggerItem key={s.id}>
                    <ServiceCard s={s} categoryColor={cat.color} onClick={() => setDialog({ kind: "edit", service: s })} />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          );
        })}
        {grouped.has(null) && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Tag className="size-3.5 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sin categoría</h2>
            </div>
            <Stagger className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(grouped.get(null) ?? []).map((s) => (
                <StaggerItem key={s.id}>
                  <ServiceCard s={s} onClick={() => setDialog({ kind: "edit", service: s })} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </div>

      {dialog && (
        <ServiceDialog
          mode={dialog.kind}
          service={dialog.kind === "edit" ? dialog.service : null}
          categories={categories}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

function ServiceCard({
  s,
  categoryColor,
  onClick,
}: {
  s: Service;
  categoryColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full w-full flex-col items-start gap-2 rounded-xl border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-blush-300/60 hover:shadow-card hover:-translate-y-0.5"
    >
      <div className="flex w-full items-start gap-3">
        <span
          className="mt-1 size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: s.color ?? categoryColor ?? "#f9b8c1" }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium tracking-tight">{s.name}</span>
            {!s.is_active && <Badge variant="soft" className="shrink-0 text-[10px]">Pausado</Badge>}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {s.duration_minutes}min
            </span>
            <span className="font-medium tabular-nums text-foreground">{formatCents(s.price_cents)}</span>
          </div>
        </div>
      </div>
      {(s.requires_consent || s.requires_room) && (
        <div className="flex flex-wrap gap-1">
          {s.requires_room && <Badge variant="soft" className="text-[10px]">Cabina</Badge>}
          {s.requires_consent && <Badge variant="soft" className="text-[10px]">Consent.</Badge>}
        </div>
      )}
    </button>
  );
}

function ServiceDialog({
  mode,
  service,
  categories,
  onClose,
}: {
  mode: "new" | "edit";
  service: Service | null;
  categories: Category[];
  onClose: () => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [categoryId, setCategoryId] = useState(service?.category_id ?? "");
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? 60));
  const [price, setPrice] = useState(String(service?.price_cents ?? 0));
  const [color, setColor] = useState(service?.color ?? PALETTE[0]!);
  const [isActive, setIsActive] = useState(service?.is_active ?? true);
  const [onlineBookable, setOnlineBookable] = useState(service?.online_bookable ?? true);
  const [requiresRoom, setRequiresRoom] = useState(service?.requires_room ?? false);
  const [requiresConsent, setRequiresConsent] = useState(service?.requires_consent ?? false);
  const [pending, startTransition] = useTransition();

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("description", description);
    if (categoryId) fd.set("category_id", categoryId);
    fd.set("duration_minutes", duration);
    fd.set("price_cents", price);
    fd.set("color", color);
    if (isActive) fd.set("is_active", "on");
    if (onlineBookable) fd.set("online_bookable", "on");
    if (requiresRoom) fd.set("requires_room", "on");
    if (requiresConsent) fd.set("requires_consent", "on");
    return fd;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = buildFormData();
    startTransition(async () => {
      const r = mode === "edit" && service
        ? await updateServiceAction(service.id, null, fd)
        : await createServiceAction(null, fd);
      if (r.ok) {
        toast.success(mode === "edit" ? "Servicio actualizado" : "Servicio creado");
        onClose();
      } else toast.error(r.error);
    });
  }

  function handleDelete() {
    if (!service) return;
    if (!confirm(`¿Eliminar "${service.name}"?\n\nSi tiene turnos cargados, se pausa en lugar de borrarse.`)) return;
    startTransition(async () => {
      const r = await deleteServiceAction(service.id);
      if (r.ok) {
        toast.success("Servicio eliminado");
        onClose();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nuevo servicio" : service?.name}</DialogTitle>
          {mode === "edit" && (
            <DialogDescription>Editá los datos o eliminalo.</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Esmaltado semipermanente" />
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qué incluye el servicio" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Color en agenda</Label>
              <div className="flex flex-wrap gap-1.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-7 rounded-full transition-transform",
                      c === color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Duración (minutos)</Label>
              <Input type="number" min="5" max="600" step="5" required value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Precio (ARS)</Label>
              <Input type="number" min="0" step="100" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" />
              <p className="text-[10px] text-muted-foreground">Sin decimales.</p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-cream-50/60 p-3">
            <CheckboxField checked={isActive} onChange={setIsActive} label="Activo (se puede agendar)" />
            <CheckboxField checked={onlineBookable} onChange={setOnlineBookable} label="Reservable desde el link público" />
            <CheckboxField checked={requiresRoom} onChange={setRequiresRoom} label="Requiere cabina" />
            <CheckboxField checked={requiresConsent} onChange={setRequiresConsent} label="Requiere consentimiento firmado" />
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

function CheckboxField({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-card/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-border accent-primary"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
