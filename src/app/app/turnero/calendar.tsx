"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDndMonitor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatCents, initials } from "@/lib/utils";
import { AppointmentDialog } from "./appointment-dialog";
import { moveAppointmentAction } from "./actions";

type Professional = {
  id: string;
  display_name: string;
  color: string | null;
  avatar_url: string | null;
};
type Room = { id: string; name: string; color: string | null };
type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  color: string | null;
  category_id: string | null;
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
  appointment_services: Array<{
    service_id: string;
    services: { name: string; color: string | null; duration_minutes: number } | null;
  }>;
  appointment_professionals: Array<{ professional_id: string }>;
  appointment_rooms: Array<{ room_id: string }>;
};

// ── Layout constants ────────────────────────────────────────────────────────
const START_HOUR = 7;
const END_HOUR = 23;
const SLOT_MIN = 15;
const ROW_PX = 18; // alto por slot de 15 min → 72px/hora
const TIME_COL_PX = 56;
const MIN_COL_PX = 220;
const SNAP_MIN = 5; // snap a 5 min en drag

const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MIN;
const HOUR_LABEL_EVERY = 60 / SLOT_MIN;

export function Calendar({
  date,
  professionals,
  rooms,
  services,
  appointments,
}: {
  date: string;
  professionals: Professional[];
  rooms: Room[];
  services: Service[];
  appointments: Appointment[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState<
    | null
    | { kind: "new"; defaults: { professionalId: string; startsAt: string; endsAt: string } }
    | { kind: "edit"; appointment: Appointment }
  >(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingAppt = useMemo(
    () => (draggingId ? appointments.find((a) => a.id === draggingId) ?? null : null),
    [draggingId, appointments],
  );

  const day = useMemo(() => new Date(date), [date]);
  const isToday = useMemo(() => {
    const t = new Date();
    return t.toDateString() === day.toDateString();
  }, [day]);

  // ── Mobile: 1 columna por vez ────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [mobileProfId, setMobileProfId] = useState<string | null>(null);
  const visibleProfessionals = useMemo(() => {
    if (!isMobile) return professionals;
    const id = mobileProfId ?? professionals[0]?.id;
    return professionals.filter((p) => p.id === id);
  }, [isMobile, mobileProfId, professionals]);

  useEffect(() => {
    if (isMobile && !mobileProfId && professionals[0]) {
      setMobileProfId(professionals[0].id);
    }
  }, [isMobile, mobileProfId, professionals]);

  const apptsByProf = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      for (const ap of a.appointment_professionals) {
        if (!map.has(ap.professional_id)) map.set(ap.professional_id, []);
        map.get(ap.professional_id)!.push(a);
      }
    }
    return map;
  }, [appointments]);

  const statsByProf = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    for (const p of professionals) map.set(p.id, { count: 0, revenue: 0 });
    for (const a of appointments) {
      if (a.status === "cancelled" || a.status === "no_show") continue;
      for (const ap of a.appointment_professionals) {
        const s = map.get(ap.professional_id);
        if (!s) continue;
        s.count += 1;
        s.revenue += a.total_cents;
      }
    }
    return map;
  }, [appointments, professionals]);

  const changeDay = useCallback((delta: number) => {
    const newDate = new Date(day);
    newDate.setDate(newDate.getDate() + delta);
    const iso = newDate.toISOString().slice(0, 10);
    startTransition(() => router.push(`/app/turnero?date=${iso}`));
  }, [day, router]);

  const gotoDate = useCallback((dateStr: string) => {
    startTransition(() => router.push(`/app/turnero?date=${dateStr}`));
  }, [router]);

  useLayoutEffect(() => {
    const target = isToday ? new Date().getHours() - 1 : 9;
    const targetSlot = ((target - START_HOUR) * 60) / SLOT_MIN;
    if (scrollRef.current && targetSlot > 0) {
      scrollRef.current.scrollTop = Math.max(0, targetSlot * ROW_PX);
    }
  }, [isToday, date]);

  const [nowOffset, setNowOffset] = useState<number | null>(null);
  useEffect(() => {
    if (!isToday) { setNowOffset(null); return; }
    function tick() {
      const n = new Date();
      const minutesFromStart = (n.getHours() - START_HOUR) * 60 + n.getMinutes();
      if (minutesFromStart < 0 || minutesFromStart > (END_HOUR - START_HOUR) * 60) {
        setNowOffset(null);
      } else {
        setNowOffset((minutesFromStart / SLOT_MIN) * ROW_PX);
      }
    }
    tick();
    const t = setInterval(tick, 30 * 1000);
    return () => clearInterval(t);
  }, [isToday]);

  function openNewDialog(profId?: string) {
    const starts = new Date(day);
    starts.setHours(10, 0, 0, 0);
    const ends = new Date(starts);
    ends.setMinutes(ends.getMinutes() + 60);
    setDialog({
      kind: "new",
      defaults: {
        professionalId: profId ?? professionals[0]?.id ?? "",
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
      },
    });
  }

  const handleSlotClick = useCallback((profId: string, slotMin: number) => {
    const starts = new Date(day);
    const h = Math.floor((START_HOUR * 60 + slotMin) / 60);
    const m = (START_HOUR * 60 + slotMin) % 60;
    starts.setHours(h, m, 0, 0);
    const ends = new Date(starts);
    ends.setMinutes(ends.getMinutes() + 60);
    setDialog({
      kind: "new",
      defaults: {
        professionalId: profId,
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
      },
    });
  }, [day]);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  function handleDragStart(e: DragStartEvent) {
    setDraggingId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setDraggingId(null);
    const { active, over, delta } = e;
    if (!over) return;
    const appt = appointments.find((a) => a.id === active.id);
    if (!appt) return;

    const targetProfId = String(over.id);
    const currentProfId = appt.appointment_professionals[0]?.professional_id;

    const newStart = computeSnappedStart(appt.starts_at, delta.y);
    const duration = new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    if (newStart.getTime() === new Date(appt.starts_at).getTime() && targetProfId === currentProfId) {
      return;
    }

    const r = await moveAppointmentAction({
      appointment_id: appt.id,
      starts_at: newStart.toISOString(),
      ends_at: newEnd.toISOString(),
      professional_id: targetProfId !== currentProfId ? targetProfId : undefined,
    });
    if (!r.ok) {
      toast.error(r.error);
    } else {
      toast.success("Turno movido", {
        description: newStart.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      });
      router.refresh();
    }
  }

  const gridStyle = {
    gridTemplateColumns: isMobile
      ? `${TIME_COL_PX - 8}px 1fr`
      : `${TIME_COL_PX}px repeat(${visibleProfessionals.length}, minmax(${MIN_COL_PX}px, 1fr))`,
  };
  const totalHeight = TOTAL_SLOTS * ROW_PX;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-[calc(100dvh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-card/40 px-3 py-2.5 backdrop-blur md:gap-2 md:px-8 md:py-3">
        <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-card p-0.5">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => changeDay(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => gotoDate(new Date().toISOString().slice(0, 10))}
            className={cn("h-8 px-2 text-xs font-medium md:px-3 md:text-sm", isToday && "text-blush-700")}
          >
            Hoy
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => changeDay(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <DatePopover date={day} onChange={gotoDate} />

        <div className="ml-1 hidden min-w-0 md:block">
          <div className="text-sm font-medium tracking-tight first-letter:uppercase">
            {day.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div className="text-xs text-muted-foreground">
            {appointments.length} turnos · {formatCents(appointments.reduce((s, a) => a.status === "cancelled" || a.status === "no_show" ? s : s + a.total_cents, 0))}
          </div>
        </div>

        <div className="ml-auto">
          <Button variant="brand" size="sm" onClick={() => openNewDialog()} className="h-9 px-3 md:h-9 md:px-4">
            <Plus className="size-4" />
            <span className="hidden md:inline">Nuevo turno</span>
          </Button>
        </div>
      </div>

      {/* Mobile: tabs de profesionales */}
      {isMobile && professionals.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-border/60 bg-card/30 px-3 py-2">
          {professionals.map((p) => {
            const active = (mobileProfId ?? professionals[0]?.id) === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setMobileProfId(p.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                  active
                    ? "border-blush-500 bg-blush-50 text-blush-800"
                    : "border-border bg-card text-foreground hover:border-blush-300/60",
                )}
              >
                <Avatar className="size-5">
                  <AvatarFallback style={{ background: p.color ?? "#8b5cf6", color: "white" }} className="text-[9px]">
                    {initials(p.display_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[120px]">{p.display_name}</span>
              </button>
            );
          })}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <div ref={scrollRef} className="relative flex-1 overflow-auto bg-gradient-to-b from-cream-50/60 to-cream-50">
          <div className="grid min-w-fit" style={gridStyle}>
            {/* Sticky headers */}
            <div className="sticky top-0 z-30 h-14 border-b border-border/60 bg-background/95 backdrop-blur" />
            {visibleProfessionals.map((p) => {
              const stats = statsByProf.get(p.id) ?? { count: 0, revenue: 0 };
              return (
                <div
                  key={p.id}
                  className="group sticky top-0 z-30 flex h-14 items-center gap-2.5 border-b border-l border-border/60 bg-background/95 px-3 backdrop-blur"
                >
                  <Avatar className="size-8">
                    <AvatarFallback style={{ background: `linear-gradient(135deg, ${p.color ?? "#8b5cf6"}, ${p.color ?? "#8b5cf6"})` }}>
                      {initials(p.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium tracking-tight">{p.display_name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5"><Users className="size-2.5" /> {stats.count}</span>
                      <span className="tabular-nums font-medium text-foreground/70">{formatCents(stats.revenue)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => openNewDialog(p.id)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              );
            })}

            {/* Time column */}
            <div className="relative" style={{ height: totalHeight }}>
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, h) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[10px] font-medium tabular-nums text-muted-foreground"
                  style={{ top: h * HOUR_LABEL_EVERY * ROW_PX }}
                >
                  {String(START_HOUR + h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Professional columns */}
            {visibleProfessionals.map((p) => (
              <ProfessionalColumn
                key={p.id}
                professional={p}
                appointments={apptsByProf.get(p.id) ?? []}
                day={day}
                totalHeight={totalHeight}
                draggingId={draggingId}
                draggingAppt={draggingAppt}
                onSlotClick={(slotMin) => handleSlotClick(p.id, slotMin)}
                onAppointmentClick={(a) => setDialog({ kind: "edit", appointment: a })}
              />
            ))}

            {/* Now indicator */}
            {nowOffset !== null && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                style={{ top: nowOffset + 56 }}
              >
                <div className="relative" style={{ marginLeft: TIME_COL_PX - 6 }}>
                  <span className="absolute -left-1 -top-1.5 inline-flex size-3 items-center justify-center">
                    <span className="absolute inline-flex size-3 animate-ping rounded-full bg-blush-500/60" />
                    <span className="relative inline-flex size-2 rounded-full bg-blush-600" />
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-blush-500/80 via-blush-400/40 to-transparent" />
              </div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {draggingAppt ? (
            <div
              className="rounded-lg border-l-[3px] bg-card/95 px-2.5 py-1.5 shadow-card backdrop-blur opacity-90"
              style={{
                borderLeftColor: draggingAppt.appointment_services[0]?.services?.color ?? "#a78bfa",
                width: 220,
                transform: "rotate(-1.5deg)",
              }}
            >
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {new Date(draggingAppt.starts_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="truncate text-xs font-medium tracking-tight">
                {draggingAppt.clients?.full_name ?? draggingAppt.walk_in_name ?? "—"}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {dialog && (
          <AppointmentDialog
            mode={dialog.kind}
            defaults={dialog.kind === "new" ? dialog.defaults : undefined}
            appointment={dialog.kind === "edit" ? dialog.appointment : undefined}
            professionals={professionals}
            rooms={rooms}
            services={services}
            onClose={() => setDialog(null)}
            onSuccess={() => {
              setDialog(null);
              toast.success("Turno guardado");
              startTransition(() => router.refresh());
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Professional column ────────────────────────────────────────────────────

function ProfessionalColumn({
  professional,
  appointments,
  day,
  totalHeight,
  draggingId,
  draggingAppt,
  onSlotClick,
  onAppointmentClick,
}: {
  professional: Professional;
  appointments: Appointment[];
  day: Date;
  totalHeight: number;
  draggingId: string | null;
  draggingAppt: Appointment | null;
  onSlotClick: (slotMin: number) => void;
  onAppointmentClick: (a: Appointment) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: professional.id });
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);

  // Drop preview state: posición + horarios calculados a partir del drag
  const [dropPreview, setDropPreview] = useState<{
    top: number;
    height: number;
    startsAt: Date;
    endsAt: Date;
    sourceProfId: string;
  } | null>(null);

  useDndMonitor({
    onDragOver(e) {
      if (!draggingAppt) return;
      if (e.over?.id !== professional.id) {
        setDropPreview(null);
        return;
      }
      const newStart = computeSnappedStart(draggingAppt.starts_at, e.delta.y);
      const duration = new Date(draggingAppt.ends_at).getTime() - new Date(draggingAppt.starts_at).getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      const startOfDay = new Date(day);
      startOfDay.setHours(START_HOUR, 0, 0, 0);
      const minutesFromStart = (newStart.getTime() - startOfDay.getTime()) / 60000;
      if (minutesFromStart < 0 || minutesFromStart > (END_HOUR - START_HOUR) * 60) {
        setDropPreview(null);
        return;
      }

      setDropPreview({
        top: (minutesFromStart / SLOT_MIN) * ROW_PX,
        height: (duration / 60000 / SLOT_MIN) * ROW_PX,
        startsAt: newStart,
        endsAt: newEnd,
        sourceProfId: draggingAppt.appointment_professionals[0]?.professional_id ?? "",
      });
    },
    onDragEnd() { setDropPreview(null); },
    onDragCancel() { setDropPreview(null); },
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (draggingId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slot = Math.floor(y / ROW_PX);
    setHoverSlot(slot);
  }

  const isSameColumn = dropPreview?.sourceProfId === professional.id;

  return (
    <div
      ref={setNodeRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverSlot(null)}
      onClick={(e) => {
        if (draggingId) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const slotMin = Math.floor(y / ROW_PX) * SLOT_MIN;
        onSlotClick(slotMin);
      }}
      className={cn(
        "relative cursor-pointer border-l border-border/60 transition-colors",
        isOver && !dropPreview && "bg-blush-50/30",
      )}
      style={{ height: totalHeight }}
    >
      {/* Slot grid lines */}
      {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
        const isHour = i % HOUR_LABEL_EVERY === 0;
        const isHalf = i % (HOUR_LABEL_EVERY / 2) === 0;
        return (
          <div
            key={i}
            className={cn(
              "absolute left-0 right-0",
              isHour ? "border-t border-border/60" : isHalf ? "border-t border-dashed border-border/30" : "",
            )}
            style={{ top: i * ROW_PX, height: ROW_PX }}
          />
        );
      })}

      {/* Hover ghost preview — solo sobre slots vacíos */}
      {hoverSlot !== null && !draggingId && !isSlotOccupied(appointments, day, hoverSlot, 4) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute left-1 right-1 rounded-md border-2 border-dashed border-blush-300/80"
          style={{ top: hoverSlot * ROW_PX, height: ROW_PX * 4 }}
        >
          <div className="absolute -top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-blush-500 px-1.5 py-0.5 text-[9px] font-medium text-white shadow-soft">
            + Crear turno
          </div>
        </motion.div>
      )}

      {/* Drop preview — borde dashed + chip flotante con hora; sin tapar */}
      {dropPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="pointer-events-none absolute left-1 right-1 z-40 rounded-lg border-2 border-dashed border-blush-500"
          style={{ top: dropPreview.top, height: dropPreview.height }}
        >
          <div className="absolute -top-3 left-2 inline-flex items-center gap-1 rounded-full bg-blush-500 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-blush">
            {dropPreview.startsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            <span className="opacity-70">→</span>
            {dropPreview.endsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </div>
          {!isSameColumn && dropPreview.height >= 30 && (
            <div className="absolute -top-3 right-2 inline-flex items-center rounded-full bg-blush-50 px-2 py-0.5 text-[9px] font-medium tracking-tight text-blush-700 shadow-soft">
              → {professional.display_name.split(" ")[0]}
            </div>
          )}
        </motion.div>
      )}

      {/* Appointments */}
      {appointments.map((a) => (
        <AppointmentBlock
          key={a.id}
          appt={a}
          day={day}
          isDraggingThis={draggingId === a.id}
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentClick(a);
          }}
        />
      ))}
    </div>
  );
}

// ─── Appointment block ──────────────────────────────────────────────────────

function AppointmentBlock({
  appt,
  day,
  isDraggingThis,
  onClick,
}: {
  appt: Appointment;
  day: Date;
  isDraggingThis: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: appt.id });

  const starts = new Date(appt.starts_at);
  const ends = new Date(appt.ends_at);
  const startOfDay = new Date(day);
  startOfDay.setHours(START_HOUR, 0, 0, 0);
  const startMin = Math.max(0, (starts.getTime() - startOfDay.getTime()) / 60000);
  const durMin = Math.max(SLOT_MIN, (ends.getTime() - starts.getTime()) / 60000);
  const top = (startMin / SLOT_MIN) * ROW_PX;
  const height = (durMin / SLOT_MIN) * ROW_PX;

  const serviceColor = appt.appointment_services[0]?.services?.color ?? "#a78bfa";
  const cancelled = appt.status === "cancelled" || appt.status === "no_show";
  const completed = appt.status === "completed";
  const inProgress = appt.status === "in_progress";
  const pending = appt.status === "pending";

  const name = appt.clients?.full_name ?? appt.walk_in_name ?? "Sin nombre";
  const serviceLine = appt.appointment_services.map((s) => s.services?.name).filter(Boolean).join(" · ");

  const isCompact = height < 56;
  const isXCompact = height < 36;

  const style: React.CSSProperties = {
    top,
    height: Math.max(ROW_PX, height) - 2,
    left: 4,
    right: 4,
    borderLeftColor: serviceColor,
    background: `linear-gradient(135deg, ${hexWithAlpha(serviceColor, 0.12)}, ${hexWithAlpha(serviceColor, 0.05)})`,
    opacity: isDraggingThis ? 0.12 : cancelled ? 0.5 : 1,
    zIndex: isDragging ? 50 : 10,
    visibility: isDraggingThis ? "hidden" : "visible",
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: isDraggingThis ? 0.35 : cancelled ? 0.5 : 1, scale: 1 }}
      onClick={onClick}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group absolute flex select-none flex-col items-stretch overflow-hidden rounded-lg border border-border/40 border-l-[3px] bg-card px-2 py-1.5 text-left shadow-soft transition-all",
        "hover:shadow-card hover:border-blush-300/40 hover:-translate-y-px",
        "[cursor:grab] active:[cursor:grabbing]",
        cancelled && "line-through",
      )}
    >
      {/* Drag handle indicator — visible on hover */}
      <span className="pointer-events-none absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-50">
        <GripVertical className="size-3 text-muted-foreground" />
      </span>

      {/* Status dot */}
      {inProgress && (
        <span className="absolute right-1.5 top-1.5 inline-flex size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_oklch(0.65_0.15_150/0.18)]" />
      )}
      {pending && !isXCompact && (
        <span className="absolute right-1.5 top-1.5 inline-flex size-1.5 rounded-full bg-peach-500" />
      )}
      {completed && (
        <span className="absolute right-1.5 top-1.5 inline-flex size-1.5 rounded-full bg-cream-400" />
      )}

      {isXCompact ? (
        <div className="flex items-center gap-1 truncate pr-3 text-[10px] font-medium tracking-tight">
          <span className="tabular-nums text-muted-foreground">
            {starts.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="truncate">{name}</span>
        </div>
      ) : isCompact ? (
        <>
          <div className="flex items-center gap-1 pr-3 text-[10px] tabular-nums text-muted-foreground">
            {starts.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="truncate text-xs font-medium tracking-tight">{name}</div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1 pr-3 text-[10px] tabular-nums text-muted-foreground">
            {starts.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            <span className="opacity-50">→</span>
            {ends.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            {pending && <Badge variant="warning" className="ml-auto h-3.5 px-1 text-[8px]">Pendiente</Badge>}
            {inProgress && <Badge variant="success" className="ml-auto h-3.5 px-1 text-[8px]">En curso</Badge>}
          </div>
          <div className="mt-0.5 truncate text-xs font-medium tracking-tight">{name}</div>
          {height > 64 && (
            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {serviceLine || "—"}
            </div>
          )}
          {height > 84 && appt.total_cents > 0 && (
            <div className="mt-auto pt-1 text-[10px] font-medium tabular-nums text-foreground/70">
              {formatCents(appt.total_cents)}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

// ─── Date popover ───────────────────────────────────────────────────────────

function DatePopover({ date, onChange }: { date: Date; onChange: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));

  const days = useMemo(() => {
    const firstDay = new Date(viewMonth);
    firstDay.setDate(1);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const lastDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: Array<{ d: Date | null; key: string }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ d: null, key: `e${i}` });
    for (let d = 1; d <= lastDate; d++) {
      cells.push({ d: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d), key: `d${d}` });
    }
    return cells;
  }, [viewMonth]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <CalendarIcon className="size-3.5" />
          <span className="hidden md:inline">Fecha</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            className="rounded p-1 hover:bg-blush-100/60"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-sm font-medium tracking-tight first-letter:uppercase">
            {viewMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            className="rounded p-1 hover:bg-blush-100/60"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-0.5 text-center">
          {["L", "M", "M", "J", "V", "S", "D"].map((dl, i) => (
            <div key={i} className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {dl}
            </div>
          ))}
          {days.map((c) => {
            if (!c.d) return <div key={c.key} />;
            const isToday = c.d.toDateString() === today.toDateString();
            const isSelected = c.d.toDateString() === date.toDateString();
            return (
              <button
                key={c.key}
                onClick={() => {
                  onChange(c.d!.toISOString().slice(0, 10));
                  setOpen(false);
                }}
                className={cn(
                  "h-8 rounded-md text-sm tabular-nums transition-colors",
                  isSelected && "bg-blush-500 text-white",
                  !isSelected && isToday && "border border-blush-300 text-blush-700 font-medium",
                  !isSelected && !isToday && "hover:bg-blush-50",
                )}
              >
                {c.d.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function isSlotOccupied(
  appointments: Appointment[],
  day: Date,
  slotIndex: number,
  spanSlots: number,
): boolean {
  const startOfDay = new Date(day);
  startOfDay.setHours(START_HOUR, 0, 0, 0);
  const slotStart = new Date(startOfDay.getTime() + slotIndex * SLOT_MIN * 60_000);
  const slotEnd = new Date(slotStart.getTime() + spanSlots * SLOT_MIN * 60_000);
  for (const a of appointments) {
    if (a.status === "cancelled" || a.status === "no_show") continue;
    const aStart = new Date(a.starts_at);
    const aEnd = new Date(a.ends_at);
    if (aStart < slotEnd && aEnd > slotStart) return true;
  }
  return false;
}

function computeSnappedStart(originalISO: string, deltaY: number): Date {
  const origStart = new Date(originalISO);
  const deltaMin = Math.round((deltaY / ROW_PX) * SLOT_MIN / SNAP_MIN) * SNAP_MIN;
  const newStart = new Date(origStart);
  newStart.setMinutes(newStart.getMinutes() + deltaMin);
  // Snap absolute minutes to SNAP_MIN
  const m = newStart.getMinutes();
  newStart.setMinutes(Math.round(m / SNAP_MIN) * SNAP_MIN);
  newStart.setSeconds(0, 0);
  return newStart;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return `rgba(167, 139, 250, ${alpha})`;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
