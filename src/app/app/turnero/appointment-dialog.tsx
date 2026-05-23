"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertOctagon,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock,
  DoorOpen,
  Loader2,
  Phone,
  Play,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn, formatCents, initials } from "@/lib/utils";
import {
  createAppointmentAction,
  updateAppointmentAction,
  updateAppointmentStatusAction,
  deleteAppointmentAction,
} from "./actions";

type Professional = { id: string; display_name: string; color: string | null };
type Room = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  color?: string | null;
  category_id?: string | null;
};

type Appointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  total_cents: number;
  client_id: string | null;
  walk_in_name: string | null;
  clients: { id: string; full_name: string; phone_e164: string | null } | null;
  appointment_services: Array<{ service_id: string }>;
  appointment_professionals: Array<{ professional_id: string }>;
  appointment_rooms: Array<{ room_id: string }>;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "No vino",
};

export function AppointmentDialog({
  mode,
  defaults,
  appointment,
  professionals,
  rooms,
  services,
  onClose,
  onSuccess,
}: {
  mode: "new" | "edit";
  defaults?: { professionalId: string; startsAt: string; endsAt: string };
  appointment?: Appointment;
  professionals: Professional[];
  rooms: Room[];
  services: Service[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const initial = useMemo(
    () =>
      mode === "edit" && appointment
        ? {
            professionalIds: appointment.appointment_professionals.map((p) => p.professional_id),
            roomIds: appointment.appointment_rooms.map((r) => r.room_id),
            serviceIds: appointment.appointment_services.map((s) => s.service_id),
            startsAt: appointment.starts_at,
            clientName: appointment.clients?.full_name ?? appointment.walk_in_name ?? "",
            notes: appointment.notes ?? "",
          }
        : {
            professionalIds: defaults?.professionalId ? [defaults.professionalId] : [],
            roomIds: [],
            serviceIds: [],
            startsAt: defaults?.startsAt ?? new Date().toISOString(),
            clientName: "",
            notes: "",
          },
    [mode, appointment, defaults],
  );

  const [serviceIds, setServiceIds] = useState<string[]>(initial.serviceIds);
  const [profIds, setProfIds] = useState<string[]>(initial.professionalIds);
  const [roomIds, setRoomIds] = useState<string[]>(initial.roomIds);
  const [clientName, setClientName] = useState(initial.clientName);
  const [notes, setNotes] = useState(initial.notes);
  const [dateStr, setDateStr] = useState(initial.startsAt.slice(0, 10));
  const [timeStr, setTimeStr] = useState(initial.startsAt.slice(11, 16));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalDuration = useMemo(
    () => serviceIds.reduce((s, id) => s + (services.find((x) => x.id === id)?.duration_minutes ?? 0), 0),
    [serviceIds, services],
  );

  const totalPrice = useMemo(
    () => serviceIds.reduce((s, id) => s + (services.find((x) => x.id === id)?.price_cents ?? 0), 0),
    [serviceIds, services],
  );

  const startsAt = useMemo(() => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return Number.isNaN(d.getTime()) ? new Date(initial.startsAt) : d;
  }, [dateStr, timeStr, initial.startsAt]);

  const endsAt = useMemo(() => {
    const e = new Date(startsAt);
    e.setMinutes(e.getMinutes() + (totalDuration || 60));
    return e;
  }, [startsAt, totalDuration]);

  const groupedServices = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const k = s.category_id ?? "sin";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return map;
  }, [services]);

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  async function handleSave() {
    setError(null);
    if (profIds.length === 0) { setError("Elegí al menos un profesional."); return; }
    if (!clientName.trim()) { setError("Necesitamos un nombre para el turno."); return; }
    if (serviceIds.length === 0) { setError("Elegí al menos un servicio."); return; }

    startTransition(async () => {
      if (mode === "edit" && appointment) {
        const r = await updateAppointmentAction({
          appointment_id: appointment.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          walk_in_name: clientName,
          service_ids: serviceIds,
          professional_ids: profIds,
          room_ids: roomIds,
          notes: notes || null,
        });
        if (!r.ok) setError(r.error);
        else onSuccess();
      } else {
        const r = await createAppointmentAction({
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          walk_in_name: clientName,
          service_ids: serviceIds,
          professional_ids: profIds,
          room_ids: roomIds,
          notes: notes || null,
          status: "confirmed",
        });
        if (!r.ok) setError(r.error);
        else onSuccess();
      }
    });
  }

  async function handleStatus(status: "completed" | "cancelled" | "no_show" | "in_progress" | "confirmed") {
    if (!appointment) return;
    startTransition(async () => {
      const r = await updateAppointmentStatusAction(appointment.id, status);
      if (!r.ok) toast.error(r.error);
      else { toast.success(STATUS_LABEL[status]); onSuccess(); }
    });
  }

  async function handleDelete() {
    if (!appointment) return;
    if (!confirm("¿Borrar este turno definitivamente?")) return;
    startTransition(async () => {
      const r = await deleteAppointmentAction(appointment.id);
      if (!r.ok) toast.error(r.error);
      else { toast.success("Turno eliminado"); onSuccess(); }
    });
  }

  const status = appointment?.status ?? "confirmed";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-border/60 bg-gradient-to-br from-blush-50 via-peach-50/40 to-cream-50 p-6">
          <Avatar className="size-14 shrink-0 ring-4 ring-card">
            <AvatarFallback className="text-lg">{initials(clientName || "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {mode === "new" ? "Nuevo turno" : clientName || "Editar turno"}
              </h2>
              {mode === "edit" && <StatusBadge status={status} />}
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
              <Clock className="size-3" />
              {startsAt.toLocaleString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              <span className="opacity-50">→</span>
              {endsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              <span className="opacity-50">·</span>
              {totalDuration || 0}min
              {totalPrice > 0 && (
                <>
                  <span className="opacity-50">·</span>
                  <span className="font-medium text-foreground">{formatCents(totalPrice)}</span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Cliente */}
            <section>
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <UserIcon className="size-3" /> Cliente
              </Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre y apellido"
                required
              />
              {appointment?.clients?.phone_e164 && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                  <Phone className="size-3" /> {appointment.clients.phone_e164}
                </div>
              )}
            </section>

            {/* Servicios */}
            <section>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="size-3" /> Servicios
                </Label>
                {serviceIds.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {totalDuration}min ·{" "}
                    <strong className="font-medium text-foreground tabular-nums">{formatCents(totalPrice)}</strong>
                  </div>
                )}
              </div>
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay servicios. Cargá uno primero.</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(groupedServices.entries()).map(([catId, svs]) => (
                    <div key={catId} className="flex flex-wrap gap-1.5">
                      {svs.map((s) => {
                        const selected = serviceIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setServiceIds((arr) => toggle(arr, s.id))}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
                              selected
                                ? "border-transparent bg-gradient-to-br from-blush-400 to-peach-400 text-white shadow-blush"
                                : "border-border bg-card text-foreground hover:border-blush-300/60 hover:bg-blush-50/40",
                            )}
                          >
                            {s.color && (
                              <span
                                className={cn("size-1.5 rounded-full", selected && "bg-white/80")}
                                style={selected ? undefined : { backgroundColor: s.color }}
                              />
                            )}
                            <span className="font-medium">{s.name}</span>
                            <span className={cn("opacity-70", selected ? "text-white/80" : "text-muted-foreground")}>
                              · {s.duration_minutes}min
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Profesional */}
            <section>
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <UserIcon className="size-3" /> Profesional
              </Label>
              <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
                {professionals.map((p) => {
                  const selected = profIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfIds((arr) => toggle(arr, p.id))}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all",
                        selected
                          ? "border-blush-500 bg-blush-50/60 shadow-soft"
                          : "border-border bg-card hover:border-blush-300/60",
                      )}
                    >
                      <Avatar className="size-7">
                        <AvatarFallback
                          style={{ background: p.color ?? "#8b5cf6", color: "white" }}
                          className="text-[10px]"
                        >
                          {initials(p.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs font-medium">{p.display_name}</span>
                      {selected && <Check className="ml-auto size-3.5 text-blush-600" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Cabina */}
            {rooms.length > 0 && (
              <section>
                <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  <DoorOpen className="size-3" /> Cabina{" "}
                  <span className="font-normal lowercase opacity-60">(opcional)</span>
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {rooms.map((r) => {
                    const selected = roomIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRoomIds((arr) => toggle(arr, r.id))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition-all",
                          selected
                            ? "border-blush-500 bg-blush-50 text-blush-800"
                            : "border-border bg-card hover:border-blush-300/60",
                        )}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Cuándo */}
            <section>
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <CalendarIcon className="size-3" /> Cuándo
              </Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Fecha</span>
                  <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Hora</span>
                  <Input
                    type="time"
                    step={300}
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-medium text-foreground/80 tabular-nums">
                <Clock className="size-3" />
                Termina:&nbsp;
                <strong>{endsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</strong>
                <span className="opacity-50">·</span>
                {totalDuration || 0}min
              </div>
            </section>

            {/* Notas */}
            <section>
              <Label className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Notas</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Pidió esmalte rojo intenso. Alérgica al limón."
                className="w-full rounded-lg border border-input bg-background p-3 text-sm shadow-soft focus:outline-none"
              />
            </section>

            {/* Status actions */}
            {mode === "edit" && appointment && (
              <section>
                <Label className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  Estado del turno
                </Label>
                <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
                  <StatusButton
                    icon={CircleDashed}
                    label="Confirmar"
                    active={status === "confirmed"}
                    onClick={() => handleStatus("confirmed")}
                    accent="blush"
                  />
                  <StatusButton
                    icon={Play}
                    label="En curso"
                    active={status === "in_progress"}
                    onClick={() => handleStatus("in_progress")}
                    accent="emerald"
                  />
                  <StatusButton
                    icon={CheckCircle2}
                    label="Completar"
                    active={status === "completed"}
                    onClick={() => handleStatus("completed")}
                    accent="emerald"
                  />
                  <StatusButton
                    icon={AlertOctagon}
                    label="No vino"
                    active={status === "no_show"}
                    onClick={() => handleStatus("no_show")}
                    accent="peach"
                  />
                </div>
              </section>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: [0, -4, 4, -4, 4, 0] }}
                  transition={{ x: { duration: 0.3 } }}
                  className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  <X className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-2 border-t border-border/60 bg-cream-50/40 px-6 py-3.5">
          {mode === "edit" ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
                <Trash2 className="text-destructive" />
                <span className="text-destructive">Eliminar</span>
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cerrar
                </Button>
                <Button variant="brand" onClick={handleSave} disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="brand" onClick={handleSave} disabled={pending} className="min-w-[140px]">
                {pending && <Loader2 className="size-4 animate-spin" />}
                Crear turno
              </Button>
            </>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant: "default" | "success" | "warning" | "destructive" | "soft" =
    status === "completed"
      ? "success"
      : status === "in_progress"
        ? "success"
        : status === "pending"
          ? "warning"
          : status === "cancelled" || status === "no_show"
            ? "destructive"
            : "default";
  return (
    <Badge variant={variant} className="text-[10px]">
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

function StatusButton({
  icon: Icon,
  label,
  active,
  onClick,
  accent,
}: {
  icon: typeof Check;
  label: string;
  active: boolean;
  onClick: () => void;
  accent: "blush" | "emerald" | "peach";
}) {
  const accents = {
    blush: { active: "border-blush-500 bg-blush-50 text-blush-800", icon: "text-blush-600" },
    emerald: { active: "border-emerald-500 bg-emerald-50 text-emerald-800", icon: "text-emerald-600" },
    peach: { active: "border-peach-500 bg-peach-50 text-peach-800", icon: "text-peach-600" },
  };
  const a = accents[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
        active
          ? a.active
          : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground",
      )}
    >
      <Icon className={cn("size-3.5", active && a.icon)} />
      {label}
    </button>
  );
}
