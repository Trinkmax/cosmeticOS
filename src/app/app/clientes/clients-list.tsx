"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Calendar, Mail, Pencil, Phone, Plus, Save, Search, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { formatCents, formatPhone, initials } from "@/lib/utils";
import { createClientAction, deleteClientAction, updateClientAction } from "./actions";

type Client = {
  id: string;
  full_name: string;
  phone_e164: string | null;
  email: string | null;
  tags: string[] | null;
  birth_date: string | null;
  gender: string | null;
  dni: string | null;
  notes: string | null;
  created_at: string;
};

type ClientDetail = Client & {
  has_critical_alerts: boolean;
  allergies: string | null;
  completed_appointments: number;
  no_show_count: number;
  total_spent_cents: number;
  active_packages: number;
  upcoming: Array<{ id: string; starts_at: string; status: string; total_cents: number }>;
};

export function ClientsList({ clients, initialQuery }: { clients: Client[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const filtered = !query.trim() ? clients : clients.filter((c) => {
    const q = query.toLowerCase();
    return c.full_name.toLowerCase().includes(q)
      || (c.phone_e164 ?? "").includes(query)
      || (c.email ?? "").toLowerCase().includes(q);
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email…"
            className="pl-9"
          />
        </div>
        <Button variant="brand" onClick={() => setOpenNew(true)}>
          <Plus />
          Nuevo cliente
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {query ? "No encontramos clientes con esos datos." : "Sin clientes todavía."}
          </p>
        </div>
      ) : (
        <Stagger className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <StaggerItem key={c.id}>
              <ClientCard client={c} onClick={() => setOpenId(c.id)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <AnimatePresence>
        {openId && (
          <ClientDetailDialog clientId={openId} onClose={() => setOpenId(null)} />
        )}
        {openNew && (
          <ClientFormDialog onClose={() => setOpenNew(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full w-full items-start gap-3 rounded-xl border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-blush-300/60 hover:shadow-card hover:-translate-y-0.5"
    >
      <Avatar className="size-10 shrink-0">
        <AvatarFallback>{initials(client.full_name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium tracking-tight">{client.full_name}</div>
        <div className="truncate text-xs text-muted-foreground tabular-nums">
          {client.phone_e164 ? formatPhone(client.phone_e164) : client.email ?? "Sin contacto"}
        </div>
        {client.tags && client.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {client.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Detail Dialog (read + edit + delete) ───────────────────────────────────

function ClientDetailDialog({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const [data, setData] = useState<ClientDetail | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [pending, startTransition] = useTransition();

  // Fetch detail on mount
  useState(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d));
  });

  function handleDelete() {
    if (!data) return;
    if (!confirm(`¿Eliminar a ${data.full_name}?\n\nSi tiene turnos cargados se desactiva en lugar de borrarse.`)) return;
    startTransition(async () => {
      const r = await deleteClientAction(clientId);
      if (r.ok) {
        toast.success("Cliente eliminado");
        onClose();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        {!data ? (
          <div className="grid place-items-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-blush-300 border-t-blush-600" />
          </div>
        ) : mode === "edit" ? (
          <ClientForm
            initial={data}
            onCancel={() => setMode("view")}
            onSaved={(updated) => {
              setData({ ...data, ...updated });
              setMode("view");
            }}
          />
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg">{initials(data.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl">{data.full_name}</DialogTitle>
                  <DialogDescription>
                    {data.phone_e164 ? formatPhone(data.phone_e164) : data.email ?? "Sin contacto"}
                  </DialogDescription>
                  {data.tags && data.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {data.tags.map((t) => (
                        <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            {data.has_critical_alerts && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl border border-peach-300 bg-peach-50 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-peach-700" />
                <div>
                  <strong className="text-peach-800">Alerta médica:</strong>{" "}
                  <span className="text-foreground/80">{data.allergies ?? "Revisar ficha"}</span>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Stat label="Visitas" value={String(data.completed_appointments)} />
              <Stat label="Gastado" value={formatCents(data.total_spent_cents)} />
              <Stat label="No-shows" value={String(data.no_show_count)} />
              <Stat label="Paquetes" value={String(data.active_packages)} />
            </div>

            <div className="space-y-3 text-sm">
              {data.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5" /> <span>{data.email}</span>
                </div>
              )}
              {data.birth_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5" /> <span>{new Date(data.birth_date).toLocaleDateString("es-AR")}</span>
                </div>
              )}
            </div>

            {data.upcoming.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximos turnos</h3>
                <ul className="space-y-1.5">
                  {data.upcoming.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
                      <div>
                        <div className="font-medium">
                          {new Date(a.starts_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", weekday: "short" })}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {new Date(a.starts_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <Badge variant="soft">{a.status}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.notes && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notas</h3>
                <p className="whitespace-pre-wrap rounded-xl bg-cream-50 p-3 text-sm">{data.notes}</p>
              </section>
            )}

            <DialogFooter className="flex flex-row-reverse items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                <Button variant="brand" onClick={() => setMode("edit")}>
                  <Pencil />
                  Editar
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
                <Trash2 className="text-destructive" />
                <span className="text-destructive">Eliminar</span>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// ─── Edit Form (reused) ─────────────────────────────────────────────────────

function ClientForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Partial<Client>;
  onCancel: () => void;
  onSaved: (data: Partial<Client>) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    full_name: initial.full_name ?? "",
    phone_e164: initial.phone_e164 ?? "",
    email: initial.email ?? "",
    birth_date: initial.birth_date ?? "",
    gender: initial.gender ?? "",
    dni: initial.dni ?? "",
    notes: initial.notes ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.set(k, v); });
    startTransition(async () => {
      const r = initial.id
        ? await updateClientAction(initial.id, fd)
        : await createClientAction(null, fd);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(initial.id ? "Cliente actualizado" : "Cliente creado");
      onSaved(form);
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initial.id ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nombre completo <span className="text-destructive">*</span></Label>
          <Input required autoFocus value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Teléfono</Label>
            <Input value={form.phone_e164} onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} placeholder="+54 11 5555-1234" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Nacimiento</Label>
            <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>DNI</Label>
            <Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Género</Label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
            >
              <option value="">—</option>
              <option value="female">Femenino</option>
              <option value="male">Masculino</option>
              <option value="non_binary">No binario</option>
              <option value="undisclosed">Prefiere no decir</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Notas</Label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Alergias, preferencias, lo que necesites recordar."
            className="w-full rounded-lg border border-input bg-background p-3 text-sm shadow-soft focus:outline-none"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="brand" loading={pending}>
            <Save />
            Guardar
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function ClientFormDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <ClientForm initial={{}} onCancel={onClose} onSaved={onClose} />
      </DialogContent>
    </Dialog>
  );
}
