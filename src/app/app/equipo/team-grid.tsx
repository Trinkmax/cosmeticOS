"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence } from "motion/react";
import { Calendar, Clock, Mail, Phone, Plus, Save, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScheduleEditor,
  DAYS,
  emptyWeek,
  type WeekSchedule,
} from "@/components/app/schedule-editor";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn, formatPhone, initials } from "@/lib/utils";
import {
  createProfessionalAction,
  deleteProfessionalAction,
  updateProfessionalAction,
  updateProfessionalScheduleAction,
} from "./actions";

type Professional = {
  id: string;
  display_name: string;
  email?: string | null;
  phone_e164?: string | null;
  color: string | null;
  avatar_url: string | null;
  is_active: boolean;
  online_bookable: boolean;
  bio: string | null;
};

const PALETTE = ["#f472b6", "#fb7185", "#fbc592", "#fde2a7", "#a3e635", "#34d399", "#22d3ee", "#60a5fa", "#a78bfa", "#c084fc"];

export function TeamGrid({ professionals }: { professionals: Professional[] }) {
  const [open, setOpen] = useState<{ kind: "new" } | { kind: "edit"; pro: Professional } | null>(null);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button variant="brand" onClick={() => setOpen({ kind: "new" })}>
          <Plus />
          Sumar profesional
        </Button>
      </div>

      <Stagger className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {professionals.map((p) => (
          <StaggerItem key={p.id}>
            <button
              onClick={() => setOpen({ kind: "edit", pro: p })}
              className="group flex h-full w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 text-left shadow-soft transition-all hover:border-blush-300/60 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-12 shrink-0">
                  <AvatarFallback style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color})` }}>
                    {initials(p.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium tracking-tight">{p.display_name}</div>
                    {!p.is_active && <Badge variant="soft" className="shrink-0 text-[10px]">Inactivo</Badge>}
                  </div>
                  {p.bio ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.bio}</p>
                  ) : (
                    <p className="mt-0.5 text-xs italic text-muted-foreground/60">Sin bio</p>
                  )}
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {p.online_bookable && <Badge variant="success" className="text-[10px]">Bookable</Badge>}
                {p.phone_e164 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
                    <Phone className="size-3" /> {formatPhone(p.phone_e164)}
                  </span>
                )}
              </div>
            </button>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatePresence>
        {open && (
          <ProfessionalDialog
            mode={open.kind}
            pro={open.kind === "edit" ? open.pro : null}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ProfessionalDialog({
  mode,
  pro,
  onClose,
}: {
  mode: "new" | "edit";
  pro: Professional | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    display_name: pro?.display_name ?? "",
    email: pro?.email ?? "",
    phone_e164: pro?.phone_e164 ?? "",
    bio: pro?.bio ?? "",
    color: pro?.color ?? PALETTE[0]!,
    is_active: pro?.is_active ?? true,
    online_bookable: pro?.online_bookable ?? true,
  });

  const [schedule, setSchedule] = useState<WeekSchedule>(emptyWeek());
  const [scheduleLoaded, setScheduleLoaded] = useState(mode === "new");
  const [pending, startTransition] = useTransition();

  // Fetch schedule del profesional cuando se abre el dialog en modo edit
  useEffect(() => {
    if (mode !== "edit" || !pro) return;
    let alive = true;
    fetch(`/api/professionals/${pro.id}/schedule`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: WeekSchedule | null) => {
        if (alive && data) {
          setSchedule(data);
          setScheduleLoaded(true);
        } else if (alive) {
          setScheduleLoaded(true);
        }
      });
    return () => { alive = false; };
  }, [mode, pro]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      let proId: string | undefined;

      if (mode === "edit" && pro) {
        const r = await updateProfessionalAction(pro.id, {
          display_name: form.display_name,
          email: form.email || null,
          phone_e164: form.phone_e164 || null,
          bio: form.bio || null,
          color: form.color,
          is_active: form.is_active,
          online_bookable: form.online_bookable,
        });
        if (!r.ok) { toast.error(r.error); return; }
        proId = pro.id;
      } else {
        const fd = new FormData();
        fd.set("display_name", form.display_name);
        if (form.email) fd.set("email", form.email);
        if (form.phone_e164) fd.set("phone_e164", form.phone_e164);
        if (form.bio) fd.set("bio", form.bio);
        fd.set("color", form.color);
        if (form.is_active) fd.set("is_active", "on");
        if (form.online_bookable) fd.set("online_bookable", "on");
        const r = await createProfessionalAction(null, fd);
        if (!r.ok) { toast.error(r.error); return; }
        proId = (r.data as { id: string } | undefined)?.id;
      }

      // Guardar schedule si tenemos id y se cargó
      if (proId && scheduleLoaded) {
        const sr = await updateProfessionalScheduleAction(proId, schedule);
        if (!sr.ok) {
          toast.error(`Profesional ok, pero horario: ${sr.error}`);
          return;
        }
      }

      toast.success(mode === "edit" ? "Profesional actualizado" : "Profesional agregado");
      onClose();
    });
  }

  function handleDelete() {
    if (!pro) return;
    if (!confirm(`¿Eliminar a ${pro.display_name}?\n\nSi tiene turnos cargados se desactiva.`)) return;
    startTransition(async () => {
      const r = await deleteProfessionalAction(pro.id);
      if (r.ok) {
        toast.success("Profesional eliminado");
        onClose();
      } else toast.error(r.error);
    });
  }

  const totalHours = DAYS.reduce((sum, d) => {
    const day = schedule[d.key];
    if (!day || day.closed) return sum;
    return sum + day.blocks.reduce((s, b) => {
      const [oh, om] = b.open.split(":").map(Number);
      const [ch, cm] = b.close.split(":").map(Number);
      return s + ((ch ?? 0) * 60 + (cm ?? 0)) - ((oh ?? 0) * 60 + (om ?? 0));
    }, 0);
  }, 0);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/60 bg-gradient-to-br from-blush-50 to-cream-50 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 ring-4 ring-card">
              <AvatarFallback style={{ background: form.color }} className="text-lg">
                {initials(form.display_name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-lg">
                {mode === "new" ? "Sumar profesional" : form.display_name || pro?.display_name}
              </DialogTitle>
              {scheduleLoaded && totalHours > 0 && (
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {Math.round(totalHours / 60)}hs semanales
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="datos" className="max-h-[60vh] overflow-y-auto p-6">
            <TabsList>
              <TabsTrigger value="datos">
                <UserIcon className="size-3.5" />
                Datos
              </TabsTrigger>
              <TabsTrigger value="horarios">
                <Calendar className="size-3.5" />
                Horarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="datos" className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input required autoFocus value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="size-3" /> Teléfono
                  </Label>
                  <Input value={form.phone_e164} onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} placeholder="+54..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="size-3" /> Email
                  </Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bio corta</Label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Especialidad, certificaciones, lo que querés mostrar en el link público."
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm shadow-soft focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Color en la agenda</Label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={cn(
                        "size-8 rounded-full transition-transform",
                        c === form.color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-cream-50/60 p-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-card/70">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Activo (aparece en agenda y se le pueden asignar turnos)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-card/70">
                  <input
                    type="checkbox"
                    checked={form.online_bookable}
                    onChange={(e) => setForm({ ...form, online_bookable: e.target.checked })}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">Reservable desde el link público</span>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="horarios" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Definí los horarios semanales del profesional. Podés sumar <strong>varios bloques</strong> por día
                para turnos cortados (ej. 9–13 y 16–20).
              </p>
              {scheduleLoaded ? (
                <ScheduleEditor value={schedule} onChange={setSchedule} />
              ) : (
                <div className="grid place-items-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-blush-300 border-t-blush-600" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-row-reverse items-center justify-between gap-2 border-t border-border/60 bg-cream-50/40 px-6 py-3.5">
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
