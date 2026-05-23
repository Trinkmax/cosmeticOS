"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Building2, Check, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import { createTenantAction, type CreateTenantState } from "./actions";

const steps = [
  { id: "business", label: "Negocio", icon: Building2 },
  { id: "location", label: "Sucursal", icon: MapPin },
  { id: "ready", label: "Listo", icon: Sparkles },
] as const;

export function OnboardingWizard({ defaultEmail }: { defaultEmail: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    locationName: "Sucursal principal",
    locationAddress: "",
    locationPhone: "",
  });

  const [state, submit] = useActionState<CreateTenantState, FormData>(
    createTenantAction,
    null,
  );

  // Auto slug
  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: f.slug && f.slug !== slugify(f.name) ? f.slug : slugify(value),
    }));
  }

  useEffect(() => {
    if (state?.ok) {
      setStep(2);
      toast.success("Tu cuenta está lista 🎉");
      const t = setTimeout(() => {
        startTransition(() => router.push("/app"));
      }, 1400);
      return () => clearTimeout(t);
    }
    if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="mt-8">
      <header className="mb-10 space-y-2 text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Configuremos tu cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Esto toma un minuto. Después podés cambiarlo cuando quieras.
        </p>
      </header>

      {/* Stepper */}
      <div className="mb-10 flex items-center justify-center gap-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: active ? 1.05 : 1,
                  backgroundColor: done
                    ? "oklch(0.6 0.15 150)"
                    : active
                      ? "var(--primary)"
                      : "var(--muted)",
                  color: done || active ? "white" : "var(--muted-foreground)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="grid size-9 place-items-center rounded-full"
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </motion.div>
              <span
                className={`hidden text-sm font-medium md:inline ${
                  active ? "text-foreground" : done ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="hidden h-px w-12 bg-border md:block" />
              )}
            </div>
          );
        })}
      </div>

      <form
        action={submit}
        className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
      >
        <input type="hidden" name="country" value="AR" />
        <input type="hidden" name="currency" value="ARS" />
        <input type="hidden" name="timezone" value="America/Argentina/Buenos_Aires" />
        <input type="hidden" name="name" value={form.name} />
        <input type="hidden" name="slug" value={form.slug} />
        <input type="hidden" name="locationName" value={form.locationName} />
        <input type="hidden" name="locationAddress" value={form.locationAddress} />
        <input type="hidden" name="locationPhone" value={form.locationPhone} />

        <div className="p-8">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <StepBusiness
                key="0"
                form={form}
                onNameChange={handleNameChange}
                onSlugChange={(v) => setForm((f) => ({ ...f, slug: slugify(v) }))}
                onEmailLabel={defaultEmail}
              />
            )}
            {step === 1 && (
              <StepLocation
                key="1"
                form={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              />
            )}
            {step === 2 && <StepReady key="2" tenantName={form.name} />}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-8 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={step === 0 || step === 2}
            onClick={() => setStep((s) => Math.max(0, s - 1) as 0 | 1 | 2)}
          >
            <ArrowLeft />
            Atrás
          </Button>

          {step === 0 && (
            <Button
              type="button"
              variant="brand"
              disabled={!form.name || !form.slug || form.slug.length < 3}
              onClick={() => setStep(1)}
            >
              Continuar
              <ArrowRight />
            </Button>
          )}

          {step === 1 && <SubmitButton />}
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="brand" loading={pending}>
      Crear mi cuenta
      <Sparkles className="size-4" />
    </Button>
  );
}

function StepBusiness({
  form,
  onNameChange,
  onSlugChange,
  onEmailLabel,
}: {
  form: { name: string; slug: string };
  onNameChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onEmailLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Sobre tu negocio</h2>
        <p className="text-sm text-muted-foreground">
          {onEmailLabel ? `Estás creando una cuenta con ${onEmailLabel}.` : null}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del negocio</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Estética Belleza Total"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL pública</Label>
        <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
          <span className="px-3 text-sm text-muted-foreground">cosmeticos.app/r/</span>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="belleza-total"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Tu link público de reservas. Podés cambiarlo después.
        </p>
      </div>
    </motion.div>
  );
}

function StepLocation({
  form,
  onChange,
}: {
  form: { locationName: string; locationAddress: string; locationPhone: string };
  onChange: (patch: Partial<{ locationName: string; locationAddress: string; locationPhone: string }>) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Tu primera sucursal</h2>
        <p className="text-sm text-muted-foreground">
          Después podés agregar más desde Configuración.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationName">Nombre</Label>
        <Input
          id="locationName"
          value={form.locationName}
          onChange={(e) => onChange({ locationName: e.target.value })}
          placeholder="Sucursal Palermo"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationAddress">
          Dirección <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="locationAddress"
          value={form.locationAddress}
          onChange={(e) => onChange({ locationAddress: e.target.value })}
          placeholder="Av. Santa Fe 1234, CABA"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationPhone">
          Teléfono <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="locationPhone"
          value={form.locationPhone}
          onChange={(e) => onChange({ locationPhone: e.target.value })}
          placeholder="+54 11 5555-1234"
        />
      </div>
    </motion.div>
  );
}

function StepReady({ tenantName }: { tenantName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="space-y-4 py-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
      >
        <Check className="size-8" strokeWidth={3} />
      </motion.div>
      <h2 className="text-2xl font-semibold">¡{tenantName} está listo!</h2>
      <p className="text-sm text-muted-foreground">
        Te llevamos al panel para que cargues tus servicios y profesionales.
      </p>
    </motion.div>
  );
}
