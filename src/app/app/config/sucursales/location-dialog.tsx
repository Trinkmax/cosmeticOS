"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, Clock, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleEditor, emptyWeek, normalizeWeek, type WeekSchedule } from "@/components/app/schedule-editor";
import { slugify } from "@/lib/utils";
import { createLocationAction, updateLocationAction } from "../actions";

type Location = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  province?: string | null;
  timezone?: string | null;
  phone_e164: string | null;
  email: string | null;
  is_active: boolean;
  is_default: boolean;
  opening_hours?: unknown;
};

const TIMEZONES = [
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Cordoba",
  "America/Argentina/Mendoza",
  "America/Argentina/Salta",
  "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia",
];

export function NewLocationDialog({ defaultTimezone = "America/Argentina/Buenos_Aires" }: { defaultTimezone?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <Plus />
          Nueva sucursal
        </Button>
      </DialogTrigger>
      <LocationDialogBody
        mode="new"
        initial={null}
        defaultTimezone={defaultTimezone}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  );
}

export function EditLocationDialog({
  location,
  open,
  onOpenChange,
}: {
  location: Location;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <LocationDialogBody
        mode="edit"
        initial={location}
        defaultTimezone={location.timezone ?? "America/Argentina/Buenos_Aires"}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

function LocationDialogBody({
  mode,
  initial,
  defaultTimezone,
  onClose,
}: {
  mode: "new" | "edit";
  initial: Location | null;
  defaultTimezone: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    timezone: initial?.timezone ?? defaultTimezone,
    phone_e164: initial?.phone_e164 ?? "",
    email: initial?.email ?? "",
    is_active: initial?.is_active ?? true,
  });
  const [schedule, setSchedule] = useState<WeekSchedule>(
    initial ? normalizeWeek(initial.opening_hours) : defaultWeekday9to19(),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        address: form.address || null,
        city: form.city || null,
        province: form.province || null,
        timezone: form.timezone,
        phone_e164: form.phone_e164 || null,
        email: form.email || null,
        is_active: form.is_active,
        opening_hours: schedule,
      };
      const r = mode === "edit" && initial
        ? await updateLocationAction(initial.id, payload)
        : await createLocationAction(payload);
      if (r.ok) {
        toast.success(mode === "edit" ? "Sucursal actualizada" : "Sucursal creada");
        onClose();
      } else setError(r.error);
    });
  }

  return (
    <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
      <DialogHeader className="border-b border-border/60 bg-gradient-to-br from-blush-50 to-cream-50 p-6">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Building2 className="size-5 text-blush-600" />
          {mode === "new" ? "Nueva sucursal" : initial?.name}
          {initial?.is_default && <Badge variant="default" className="text-[10px]">Default</Badge>}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="datos" className="max-h-[60vh] overflow-y-auto p-6">
          <TabsList>
            <TabsTrigger value="datos">
              <MapPin className="size-3.5" />
              Datos
            </TabsTrigger>
            <TabsTrigger value="horarios">
              <Clock className="size-3.5" />
              Horarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datos" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
                placeholder="Sucursal Centro"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL interna)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="centro"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Av. Colón 1234"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ciudad</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Córdoba" />
              </div>
              <div className="space-y-1.5">
                <Label>Provincia</Label>
                <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Córdoba" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input value={form.phone_e164} onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} placeholder="+54 351..." />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Zona horaria</Label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                {TIMEZONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-muted/50">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="size-4 rounded border-border accent-primary"
              />
              <span className="text-sm">Activa</span>
            </label>
          </TabsContent>

          <TabsContent value="horarios" className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Tocá un día para abrir/cerrar. Sumá <strong>varios bloques</strong> si hacés turnos cortados
              (ej. 9-13 y 17-21). Usá el ícono de copia para replicar a otros días.
            </p>
            <ScheduleEditor value={schedule} onChange={setSchedule} />
          </TabsContent>
        </Tabs>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-6 mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <Trash2 className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="border-t border-border/60 bg-cream-50/40 px-6 py-3.5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="brand" loading={pending}>
            <Save />
            Guardar
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function defaultWeekday9to19(): WeekSchedule {
  const base = emptyWeek();
  for (const k of ["mon", "tue", "wed", "thu", "fri", "sat"]) {
    base[k] = { closed: false, blocks: [{ open: "09:00", close: "19:00" }] };
  }
  return base;
}
