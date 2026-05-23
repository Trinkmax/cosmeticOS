"use client";

import { useState, useTransition } from "react";
import { Calendar, Check, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCents } from "@/lib/utils";
import {
  createCommissionRuleAction,
  generatePayoutAction,
  markPayoutPaidAction,
} from "./actions";

type Pro = { id: string; display_name: string };

export function NewRuleDialog({ professionals }: { professionals: Pro[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    applies_to: "service" as "service" | "product" | "package" | "all",
    professional_id: "",
    rule_type: "percent" as "percent" | "fixed",
    value: "10",
    priority: "100",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCommissionRuleAction({
        name: form.name,
        applies_to: form.applies_to,
        professional_id: form.professional_id || null,
        service_id: null,
        rule_type: form.rule_type,
        value_bps_or_cents:
          form.rule_type === "percent"
            ? Math.round(Number(form.value) * 100) // % → bps
            : Math.round(Number(form.value)),
        priority: Number(form.priority) || 100,
        is_active: true,
      });
      if (res.ok) {
        toast.success("Regla creada");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <Plus />
          Nueva regla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva regla de comisión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="50% sobre servicios — Romina" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Aplica a</Label>
              <select
                value={form.applies_to}
                onChange={(e) => setForm({ ...form, applies_to: e.target.value as typeof form.applies_to })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                <option value="service">Servicios</option>
                <option value="product">Productos</option>
                <option value="package">Paquetes</option>
                <option value="all">Todo</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Profesional</Label>
              <select
                value={form.professional_id}
                onChange={(e) => setForm({ ...form, professional_id: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                <option value="">Todos</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <select
                value={form.rule_type}
                onChange={(e) => setForm({ ...form, rule_type: e.target.value as "percent" | "fixed" })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto fijo (ARS)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor</Label>
              <Input type="number" step={form.rule_type === "percent" ? "0.5" : "100"} min="0" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prioridad <span className="text-xs text-muted-foreground font-normal">(menor = más específica, se aplica primero)</span></Label>
            <Input type="number" min="0" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          </div>

          <DialogFooter>
            <Button type="submit" variant="brand" loading={pending}>Crear regla</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GeneratePayoutDialog({ professionals }: { professionals: Pro[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [form, setForm] = useState({
    professional_id: professionals[0]?.id ?? "",
    period_start: firstOfMonth,
    period_end: today,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.professional_id) {
      toast.error("Elegí un profesional");
      return;
    }
    startTransition(async () => {
      const res = await generatePayoutAction({
        professional_id: form.professional_id,
        period_start: form.period_start,
        period_end: form.period_end,
      });
      if (res.ok) {
        toast.success(`Liquidación generada: ${formatCents(res.data.total_cents)}`);
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText />
          Generar liquidación
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar liquidación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Profesional</Label>
            <select
              value={form.professional_id}
              onChange={(e) => setForm({ ...form, professional_id: e.target.value })}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Desde</Label>
              <Input type="date" required value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Hasta</Label>
              <Input type="date" required value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" variant="brand" loading={pending}>
              <Calendar />
              Generar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MarkPaidButton({ payoutId }: { payoutId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await markPayoutPaidAction(payoutId);
          if (res.ok) toast.success("Marcado como pagado");
          else toast.error(res.error);
        });
      }}
    >
      <Check />
      Pagado
    </Button>
  );
}
