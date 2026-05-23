"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTenantAction } from "../actions";

const TIMEZONES = [
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Cordoba",
  "America/Argentina/Mendoza",
  "America/Argentina/Salta",
  "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia",
  "America/Montevideo",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Mexico_City",
];

const CURRENCIES = ["ARS", "UYU", "CLP", "BRL", "MXN", "USD"];

export function TenantForm({
  tenantId: _,
  initialName,
  initialTimezone,
  initialCurrency,
  slug,
  country,
}: {
  tenantId: string;
  initialName: string;
  initialTimezone: string;
  initialCurrency: string;
  slug: string;
  country: string;
}) {
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [currency, setCurrency] = useState(initialCurrency);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await updateTenantAction({ name, timezone, currency });
      if (r.ok) toast.success("Cuenta actualizada");
      else toast.error(r.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre del negocio</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={slug} disabled />
          <p className="text-xs text-muted-foreground">Solo lectura por ahora.</p>
        </div>
        <div className="space-y-1.5">
          <Label>País</Label>
          <Input value={country} disabled />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Zona horaria</Label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
          >
            {TIMEZONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Moneda</Label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="brand" loading={pending}>
          <Save />
          Guardar
        </Button>
      </div>
    </form>
  );
}
