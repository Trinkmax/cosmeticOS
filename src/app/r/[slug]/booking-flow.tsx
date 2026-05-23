"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Calendar as CalIcon, Check, Clock, Loader2, MapPin, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatCents, initials } from "@/lib/utils";
import { publicBookAction, publicGetAvailabilityAction } from "./actions";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  color: string | null;
  description: string | null;
  category_name: string | null;
};

type Professional = { id: string; name: string; color: string | null; avatar_url: string | null; bio: string | null };
type Location = { id: string; name: string; address: string | null; is_default: boolean };

type Info = {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  timezone: string;
  currency: string;
  logo_url: string | null;
  primary_color: string;
  services: Service[];
  professionals: Professional[];
  locations: Location[];
};

const STEPS = ["service", "professional", "datetime", "data", "done"] as const;
type Step = typeof STEPS[number];

export function BookingFlow({ info }: { info: Info }) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ starts_at: string; ends_at: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaultLocation = info.locations.find((l) => l.is_default) ?? info.locations[0]!;
  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of info.services) {
      const k = s.category_name ?? "Otros";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return map;
  }, [info.services]);

  function gotoNext() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]!);
  }
  function gotoBack() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]!);
  }

  async function submitBooking() {
    if (!selectedService || !selectedProf || !selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const res = await publicBookAction({
        tenant_slug: info.tenant_slug,
        full_name: name,
        phone,
        email: email || null,
        service_ids: [selectedService.id],
        professional_id: selectedProf.id,
        location_id: defaultLocation.id,
        starts_at: selectedSlot.starts_at,
      });
      if (res.ok) {
        setConfirmedId(res.data.appointment_id);
        setStep("done");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-70" />

      <header className="container mx-auto px-6 pt-8 text-center">
        {info.logo_url ? (
          <img src={info.logo_url} alt={info.tenant_name} className="mx-auto h-12" />
        ) : (
          <div
            className="mx-auto grid size-12 place-items-center rounded-2xl text-white shadow-blush"
            style={{ background: `linear-gradient(135deg, ${info.primary_color}, ${info.primary_color})` }}
          >
            <Sparkles className="size-6" />
          </div>
        )}
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{info.tenant_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Reservá en segundos.</p>
      </header>

      <div className="container mx-auto max-w-2xl px-4 pb-12 pt-8 md:px-6">
        <Stepper step={step} />

        <AnimatePresence mode="wait" initial={false}>
          {step === "service" && (
            <StepCard key="service">
              <h2 className="text-lg font-semibold tracking-tight">¿Qué te gustaría hacerte?</h2>
              <div className="mt-4 space-y-6">
                {Array.from(grouped.entries()).map(([cat, svs]) => (
                  <section key={cat}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {svs.map((s) => (
                        <motion.button
                          key={s.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { setSelectedService(s); gotoNext(); }}
                          className={cn(
                            "group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card",
                            selectedService?.id === s.id && "border-primary",
                          )}
                        >
                          <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color ?? info.primary_color }} />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{s.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {s.duration_minutes}min · {formatCents(s.price_cents, info.currency)}
                            </div>
                            {s.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">{s.description}</p>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </StepCard>
          )}

          {step === "professional" && selectedService && (
            <StepCard key="professional">
              <h2 className="text-lg font-semibold tracking-tight">¿Con quién?</h2>
              <p className="text-sm text-muted-foreground">{selectedService.name} · {selectedService.duration_minutes}min</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {info.professionals.map((p) => (
                  <motion.button
                    key={p.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedProf(p); gotoNext(); }}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card"
                  >
                    <Avatar className="size-10">
                      <AvatarFallback style={{ background: `linear-gradient(135deg, ${p.color ?? info.primary_color}, ${p.color ?? info.primary_color})` }}>
                        {initials(p.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium">{p.name}</div>
                      {p.bio && <div className="line-clamp-1 text-xs text-muted-foreground">{p.bio}</div>}
                    </div>
                  </motion.button>
                ))}
              </div>
            </StepCard>
          )}

          {step === "datetime" && selectedService && selectedProf && (
            <DateTimeStep
              key="datetime"
              tenant_slug={info.tenant_slug}
              professional={selectedProf}
              service={selectedService}
              onPick={(slot) => { setSelectedSlot(slot); gotoNext(); }}
            />
          )}

          {step === "data" && selectedService && selectedProf && selectedSlot && (
            <StepCard key="data">
              <h2 className="text-lg font-semibold tracking-tight">Tus datos</h2>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CalIcon className="size-3.5" /> {new Date(selectedSlot.starts_at).toLocaleString("es-AR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
                <div className="flex items-center gap-2"><UserIcon className="size-3.5" /> {selectedProf.name}</div>
                <div className="flex items-center gap-2"><MapPin className="size-3.5" /> {defaultLocation.name}{defaultLocation.address ? ` · ${defaultLocation.address}` : ""}</div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Nombre completo</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="María Pérez" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Teléfono</Label>
                    <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 11 5555-1234" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email <span className="text-xs text-muted-foreground font-normal">opcional</span></Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@correo.com" />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </motion.div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-cream-50 p-4">
                  <div>
                    <div className="font-medium">{selectedService.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedService.duration_minutes}min</div>
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{formatCents(selectedService.price_cents, info.currency)}</div>
                </div>

                <Button
                  variant="brand"
                  className="w-full"
                  size="xl"
                  onClick={submitBooking}
                  disabled={pending || !name || !phone}
                >
                  {pending && <Loader2 className="animate-spin" />}
                  Confirmar reserva
                </Button>
              </div>
            </StepCard>
          )}

          {step === "done" && selectedService && selectedProf && selectedSlot && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
                className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
              >
                <Check className="size-8" strokeWidth={3} />
              </motion.div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">¡Listo!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Te reservamos un turno en {info.tenant_name}.<br />
                {new Date(selectedSlot.starts_at).toLocaleString("es-AR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} con {selectedProf.name}.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Te van a confirmar por WhatsApp. ID: <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{confirmedId?.slice(0, 8)}</code>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== "service" && step !== "done" && (
          <div className="mt-4">
            <Button variant="ghost" onClick={gotoBack} size="sm">
              <ArrowLeft />
              Volver
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels: Record<Step, string> = {
    service: "Servicio",
    professional: "Profesional",
    datetime: "Día y hora",
    data: "Tus datos",
    done: "Listo",
  };
  const i = STEPS.indexOf(step);
  return (
    <div className="mb-6 flex items-center gap-2 text-xs">
      {STEPS.slice(0, 4).map((s, idx) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={cn(
              "grid size-6 place-items-center rounded-full text-[10px] transition-all",
              idx < i && "bg-emerald-500 text-white",
              idx === i && "bg-primary text-primary-foreground scale-110",
              idx > i && "bg-cream-100 text-muted-foreground",
            )}
          >
            {idx < i ? <Check className="size-3" /> : idx + 1}
          </div>
          <span className={cn("hidden tracking-tight md:inline", idx === i ? "font-medium" : "text-muted-foreground")}>
            {labels[s]}
          </span>
          {idx < 3 && <span className="h-px w-6 bg-border md:w-12" />}
        </div>
      ))}
    </div>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8"
    >
      {children}
    </motion.div>
  );
}

function DateTimeStep({
  tenant_slug,
  professional,
  service,
  onPick,
}: {
  tenant_slug: string;
  professional: Professional;
  service: Service;
  onPick: (slot: { starts_at: string; ends_at: string }) => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<Array<{ starts_at: string; ends_at: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    publicGetAvailabilityAction({
      tenant_slug,
      professional_id: professional.id,
      date,
      duration_minutes: service.duration_minutes,
    })
      .then((s) => { if (alive) setSlots(s); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tenant_slug, professional.id, date, service.duration_minutes]);

  // Próximos 14 días
  const days = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  return (
    <StepCard>
      <h2 className="text-lg font-semibold tracking-tight">Elegí día y hora</h2>
      <p className="text-sm text-muted-foreground">{service.name} con {professional.name}</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const day = new Date(`${d}T12:00:00`);
          const selected = d === date;
          return (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={cn(
                "flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-all",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {day.toLocaleDateString("es-AR", { weekday: "short" })}
              </span>
              <span className="text-lg font-semibold tabular-nums">{day.getDate()}</span>
              <span className="text-[10px] opacity-80">{day.toLocaleDateString("es-AR", { month: "short" })}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Horarios disponibles
        </div>
        {loading ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-xl bg-cream-50 px-4 py-6 text-center text-sm text-muted-foreground">
            Sin horarios disponibles este día. Probá otro.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <motion.button
                key={s.starts_at}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPick(s)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium tabular-nums transition-all hover:border-primary hover:bg-blush-50"
              >
                {new Date(s.starts_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </StepCard>
  );
}
