"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Banknote, Building2, ChevronLeft, CreditCard, Plus, Settings2, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createCashAccountAction, updateCashAccountAction, deleteCashAccountAction } from "./actions";

type Account = {
  id: string;
  name: string;
  kind: string;
  currency: string | null;
  is_active: boolean;
};

const KIND_LABEL: Record<string, string> = {
  cash: "Efectivo",
  mercadopago: "MercadoPago",
  modo: "Modo",
  bank: "Banco",
  card: "Tarjeta",
  crypto: "Crypto",
  other: "Otro",
};

const KIND_ICON: Record<string, typeof Banknote> = {
  cash: Banknote,
  mercadopago: Smartphone,
  modo: Smartphone,
  bank: Building2,
  card: CreditCard,
  crypto: CreditCard,
  other: Settings2,
};

type Mode = { kind: "list" } | { kind: "new" } | { kind: "edit"; account: Account };

export function AccountsDialog({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setTimeout(() => setMode({ kind: "list" }), 200);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings2 />
          Cuentas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode.kind !== "list" && (
              <button
                onClick={() => setMode({ kind: "list" })}
                className="rounded-md p-1 hover:bg-blush-100/60"
                aria-label="Volver"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {mode.kind === "list" && "Métodos de pago"}
            {mode.kind === "new" && "Nueva cuenta"}
            {mode.kind === "edit" && `Editar — ${mode.account.name}`}
          </DialogTitle>
          {mode.kind === "list" && (
            <DialogDescription>
              Ejemplo: "MercadoPago Kiki", "Efectivo caja chica", "Banco Galicia".
            </DialogDescription>
          )}
        </DialogHeader>

        <AnimatePresence mode="wait" initial={false}>
          {mode.kind === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {accounts.length === 0 ? (
                <p className="rounded-xl bg-cream-50 px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin cuentas todavía. Creá la primera.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {accounts.map((a) => {
                    const Icon = KIND_ICON[a.kind] ?? Settings2;
                    return (
                      <li key={a.id}>
                        <button
                          onClick={() => setMode({ kind: "edit", account: a })}
                          className="group flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-all hover:border-blush-300/60 hover:bg-blush-50/40"
                        >
                          <div className={cn(
                            "grid size-9 place-items-center rounded-lg bg-gradient-to-br",
                            a.is_active ? "from-blush-200 to-peach-200 text-blush-800" : "from-cream-200 to-cream-300 text-cream-700",
                          )}>
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-medium">{a.name}</div>
                            <div className="text-xs text-muted-foreground">{KIND_LABEL[a.kind] ?? a.kind}</div>
                          </div>
                          {!a.is_active && <Badge variant="soft" className="text-[10px]">Inactiva</Badge>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Button
                variant="brand"
                className="w-full"
                onClick={() => setMode({ kind: "new" })}
              >
                <Plus />
                Nueva cuenta
              </Button>
            </motion.div>
          )}

          {(mode.kind === "new" || mode.kind === "edit") && (
            <AccountForm
              key={mode.kind === "edit" ? mode.account.id : "new"}
              initial={mode.kind === "edit" ? mode.account : null}
              pending={pending}
              onSave={(data) => {
                startTransition(async () => {
                  const r = mode.kind === "edit"
                    ? await updateCashAccountAction(mode.account.id, data)
                    : await createCashAccountAction(data);
                  if (r.ok) {
                    toast.success(mode.kind === "edit" ? "Cuenta actualizada" : "Cuenta creada");
                    setMode({ kind: "list" });
                  } else toast.error(r.error);
                });
              }}
              onDelete={mode.kind === "edit" ? () => {
                if (!confirm(`¿Desactivar "${mode.account.name}"?\n\nLa cuenta queda en el historial pero ya no aparece para registrar pagos.`)) return;
                startTransition(async () => {
                  const r = await deleteCashAccountAction(mode.account.id);
                  if (r.ok) {
                    toast.success("Cuenta desactivada");
                    setMode({ kind: "list" });
                  } else toast.error(r.error);
                });
              } : undefined}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function AccountForm({
  initial,
  pending,
  onSave,
  onDelete,
}: {
  initial: Account | null;
  pending: boolean;
  onSave: (data: { name: string; kind: "cash" | "mercadopago" | "modo" | "bank" | "card" | "crypto" | "other"; is_active: boolean }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState(initial?.kind ?? "mercadopago");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  return (
    <motion.form
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.15 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name,
          kind: kind as "cash" | "mercadopago" | "modo" | "bank" | "card" | "crypto" | "other",
          is_active: isActive,
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Nombre</Label>
        <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="MercadoPago Kiki" />
        <p className="text-xs text-muted-foreground">Acordate de poner un nombre que distinga la cuenta (ej. dueña vs. caja).</p>
      </div>

      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(KIND_LABEL).map(([k, label]) => {
            const Icon = KIND_ICON[k] ?? Settings2;
            const selected = k === kind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-all",
                  selected ? "border-blush-400 bg-blush-50" : "border-border bg-card hover:border-blush-300/60",
                )}
              >
                <Icon className={cn("size-4", selected ? "text-blush-700" : "text-muted-foreground")} />
                <span className={selected ? "font-medium" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/50">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
        <span className="text-sm">Activa (aparece al registrar pagos)</span>
      </label>

      <div className="flex justify-between gap-2 pt-2">
        {onDelete ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDelete} disabled={pending}>
            <Trash2 className="text-destructive" />
            Desactivar
          </Button>
        ) : <span />}
        <Button type="submit" variant="brand" loading={pending}>
          Guardar
        </Button>
      </div>
    </motion.form>
  );
}
