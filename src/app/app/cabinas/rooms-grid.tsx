"use client";

import { useState, useTransition } from "react";
import { AnimatePresence } from "motion/react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";
import { createRoomAction, updateRoomAction, deleteRoomAction } from "./actions";

type Location = { id: string; name: string };
type Room = {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  is_active: boolean;
  location_id: string;
};

const COLORS = ["#06b6d4", "#f9b8c1", "#fbc592", "#fde2a7", "#c9e4d4", "#bdd4f0", "#d8c4eb", "#a78bfa"];

export function RoomsGrid({ locations, rooms }: { locations: Location[]; rooms: Room[] }) {
  const [open, setOpen] = useState<{ kind: "new" } | { kind: "edit"; room: Room } | null>(null);

  const grouped = new Map<string, Room[]>();
  for (const r of rooms) {
    if (!grouped.has(r.location_id)) grouped.set(r.location_id, []);
    grouped.get(r.location_id)!.push(r);
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button variant="brand" onClick={() => setOpen({ kind: "new" })} disabled={locations.length === 0}>
          <Plus />
          Nueva cabina
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No tenés cabinas cargadas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {locations.map((loc) => {
            const items = grouped.get(loc.id) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={loc.id}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {loc.name}
                </h2>
                <Stagger className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {items.map((r) => (
                    <StaggerItem key={r.id}>
                      <button
                        onClick={() => setOpen({ kind: "edit", room: r })}
                        className="flex h-full w-full flex-col items-start gap-2 rounded-xl border border-border/60 bg-card p-4 text-left shadow-soft transition-all hover:border-blush-300/60 hover:shadow-card hover:-translate-y-0.5"
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color ?? "#06b6d4" }} />
                            <span className="truncate font-medium tracking-tight">{r.name}</span>
                          </div>
                          {!r.is_active && <Badge variant="soft" className="shrink-0 text-[10px]">Inactiva</Badge>}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {r.description || <span className="italic opacity-60">Sin descripción</span>}
                        </p>
                      </button>
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <RoomDialog
            mode={open.kind}
            room={open.kind === "edit" ? open.room : null}
            locations={locations}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function RoomDialog({
  mode,
  room,
  locations,
  onClose,
}: {
  mode: "new" | "edit";
  room: Room | null;
  locations: Location[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: room?.name ?? "",
    description: room?.description ?? "",
    color: room?.color ?? COLORS[0]!,
    location_id: room?.location_id ?? locations[0]?.id ?? "",
    is_active: room?.is_active ?? true,
  });
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = mode === "edit" && room
        ? await updateRoomAction(room.id, form)
        : await createRoomAction(form);
      if (r.ok) {
        toast.success(mode === "edit" ? "Cabina actualizada" : "Cabina creada");
        onClose();
      } else toast.error(r.error);
    });
  }

  function handleDelete() {
    if (!room) return;
    if (!confirm(`¿Eliminar "${room.name}"?\n\nSi tiene turnos cargados, se desactiva.`)) return;
    startTransition(async () => {
      const r = await deleteRoomAction(room.id);
      if (r.ok) {
        toast.success("Cabina eliminada");
        onClose();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "new" ? "Nueva cabina" : room?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cabina 1, Sala roja..." />
          </div>

          <div className="space-y-1.5">
            <Label>Sucursal</Label>
            <select
              required
              value={form.location_id}
              onChange={(e) => setForm({ ...form, location_id: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Camilla amplia, luz cálida..." />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn(
                    "size-8 rounded-full transition-transform",
                    c === form.color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-muted/50">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-sm">Activa</span>
          </label>

          <DialogFooter className="flex flex-row-reverse items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="brand" loading={pending}>
                <Save />
                Guardar
              </Button>
            </div>
            {mode === "edit" && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
                <Trash2 className="text-destructive" />
                <span className="text-destructive">Eliminar</span>
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
