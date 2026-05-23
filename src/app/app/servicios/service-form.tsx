"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertCircle, Save } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServiceAction, type Result } from "./actions";

const PALETTE = ["#a78bfa", "#f472b6", "#fb7185", "#fb923c", "#facc15", "#a3e635", "#34d399", "#22d3ee", "#60a5fa", "#818cf8"];

type Category = { id: string; name: string; color: string };

export function ServiceForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [color, setColor] = useState(PALETTE[0]!);
  const [priceFmt, setPriceFmt] = useState("");
  const [state, submit] = useActionState<Result<{ id: string }> | null, FormData>(createServiceAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Servicio creado");
      router.push("/app/servicios");
    }
    if (state && !state.ok) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={submit} className="space-y-6">
      <input type="hidden" name="color" value={color} />

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
          <Input id="name" name="name" required autoFocus placeholder="Esmaltado semipermanente" />
        </div>

        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <select
            name="category_id"
            defaultValue=""
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="duration_minutes">Duración (minutos) <span className="text-destructive">*</span></Label>
            <Input id="duration_minutes" name="duration_minutes" type="number" min="5" max="600" step="5" defaultValue="60" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price_cents">Precio (ARS) <span className="text-destructive">*</span></Label>
            <Input
              id="price_cents"
              name="price_cents"
              type="number"
              min="0"
              step="100"
              required
              value={priceFmt}
              onChange={(e) => setPriceFmt(e.target.value)}
              placeholder="15000"
            />
            <p className="text-xs text-muted-foreground">Sin decimales. Se guarda en centavos automáticamente.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color en la agenda</Label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-7 rounded-full transition-transform ${
                  c === color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-3">
        <h3 className="font-medium">Reglas</h3>
        <CheckboxField name="is_active" defaultChecked label="Activo (disponible para agendar)" />
        <CheckboxField name="online_bookable" defaultChecked label="Reservable desde el link público" />
        <CheckboxField name="requires_room" label="Requiere cabina" />
        <CheckboxField name="requires_consent" label="Requiere consentimiento firmado" />
      </div>

      {state && !state.ok ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </motion.div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <SubmitButton />
      </div>
    </form>
  );
}

function CheckboxField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 rounded border-border accent-primary" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="brand" loading={pending}>
      <Save />
      Guardar
    </Button>
  );
}
