"use client";

import { useState, useTransition } from "react";
import { Lock, LockOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCents } from "@/lib/utils";
import { openCashSessionAction, closeCashSessionAction, registerPaymentAction } from "./actions";

type Account = { id: string; name: string; kind: string; currency: string | null };
type Client = { id: string; full_name: string };

export function OpenSessionButton() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <LockOpen />
          Abrir caja
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription>Esto inicia una sesión nueva. Los pagos del día quedan asociados acá.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Notas iniciales <span className="text-xs text-muted-foreground font-normal">opcional</span></Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Apertura matutina con $5000 en efectivo de cambio…"
            className="w-full rounded-lg border border-input bg-background p-3 text-sm shadow-soft focus:outline-none"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="brand"
            loading={pending}
            onClick={() => {
              startTransition(async () => {
                const r = await openCashSessionAction(notes);
                if (r.ok) {
                  toast.success("Caja abierta");
                  setOpen(false);
                  setNotes("");
                } else toast.error(r.error);
              });
            }}
          >
            Abrir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CloseSessionDialog({
  session,
  accounts,
}: {
  session: { id: string };
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);
  const [counted, setCounted] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Lock />
          Cerrar caja
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
          <DialogDescription>
            Anotá cuánto contás en cada cuenta. Calculamos diferencias contra el sistema automáticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
              <div>
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.kind}</div>
              </div>
              <Input
                type="number"
                step="100"
                min="0"
                placeholder="0"
                value={counted[a.id] ?? ""}
                onChange={(e) => setCounted({ ...counted, [a.id]: e.target.value })}
                className="w-32 text-right tabular-nums"
              />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label>Observaciones</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-input bg-background p-3 text-sm shadow-soft focus:outline-none"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="brand"
            loading={pending}
            onClick={() => {
              const totals: Record<string, number> = {};
              for (const [k, v] of Object.entries(counted)) {
                if (v) totals[k] = Math.round(Number(v));
              }
              startTransition(async () => {
                const r = await closeCashSessionAction({
                  session_id: session.id,
                  counted_totals: totals,
                  notes: notes || null,
                });
                if (r.ok) {
                  toast.success("Caja cerrada");
                  setOpen(false);
                } else toast.error(r.error);
              });
            }}
          >
            Cerrar caja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RegisterPaymentDialog({
  accounts,
  clients,
  disabled,
}: {
  accounts: Account[];
  clients: Client[];
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    account_id: accounts[0]?.id ?? "",
    client_id: "",
    amount: "",
    kind: "service" as "service" | "product" | "package" | "tip" | "refund" | "other",
    notes: "",
  });
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand" disabled={disabled || accounts.length === 0}>
          <Plus />
          Registrar pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>Pagos manuales (efectivo, transferencia confirmada, etc.).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cuenta</Label>
              <select
                value={form.account_id}
                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Concepto</Label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as typeof form.kind })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
              >
                <option value="service">Servicio</option>
                <option value="product">Producto</option>
                <option value="package">Paquete</option>
                <option value="tip">Propina</option>
                <option value="refund">Reembolso</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cliente <span className="text-xs text-muted-foreground font-normal">opcional</span></Label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
            >
              <option value="">— Walk-in / sin asociar —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Importe (ARS)</Label>
            <Input
              type="number"
              step="100"
              min="0"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="15000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Esmaltado + retiro semipermanente" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="brand"
            loading={pending}
            onClick={() => {
              if (!form.amount || Number(form.amount) <= 0) {
                toast.error("Ingresá un importe");
                return;
              }
              startTransition(async () => {
                const r = await registerPaymentAction({
                  account_id: form.account_id,
                  client_id: form.client_id || null,
                  appointment_id: null,
                  amount_cents: Math.round(Number(form.amount)),
                  kind: form.kind,
                  notes: form.notes || null,
                });
                if (r.ok) {
                  toast.success(`Pago de ${formatCents(Math.round(Number(form.amount)))}`);
                  setOpen(false);
                  setForm({ ...form, amount: "", notes: "", client_id: "" });
                } else toast.error(r.error);
              });
            }}
          >
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
