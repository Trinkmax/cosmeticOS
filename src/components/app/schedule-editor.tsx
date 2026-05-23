"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Block = { open: string; close: string };
export type DaySchedule = { closed: boolean; blocks: Block[] };
export type WeekSchedule = Record<string, DaySchedule>;

export const DAYS: Array<{ key: string; label: string; short: string; weekday: number }> = [
  { key: "mon", label: "Lunes", short: "Lu", weekday: 1 },
  { key: "tue", label: "Martes", short: "Ma", weekday: 2 },
  { key: "wed", label: "Miércoles", short: "Mi", weekday: 3 },
  { key: "thu", label: "Jueves", short: "Ju", weekday: 4 },
  { key: "fri", label: "Viernes", short: "Vi", weekday: 5 },
  { key: "sat", label: "Sábado", short: "Sá", weekday: 6 },
  { key: "sun", label: "Domingo", short: "Do", weekday: 0 },
];

const DEFAULT_BLOCK: Block = { open: "09:00", close: "18:00" };

export function emptyWeek(): WeekSchedule {
  const out: WeekSchedule = {};
  for (const d of DAYS) out[d.key] = { closed: true, blocks: [] };
  return out;
}

/** Normaliza formato viejo {"mon":{"open":"...","close":"..."}} al nuevo {"mon":{"closed":..,"blocks":[...]}}  */
export function normalizeWeek(raw: unknown): WeekSchedule {
  const out: WeekSchedule = {};
  const data = (raw ?? {}) as Record<string, unknown>;
  for (const d of DAYS) {
    const v = data[d.key] as
      | { closed?: boolean; blocks?: Block[]; open?: string; close?: string }
      | undefined;
    if (!v) {
      out[d.key] = { closed: true, blocks: [] };
    } else if (v.closed) {
      out[d.key] = { closed: true, blocks: [] };
    } else if (v.blocks && Array.isArray(v.blocks) && v.blocks.length > 0) {
      out[d.key] = { closed: false, blocks: v.blocks };
    } else if (v.open && v.close) {
      out[d.key] = { closed: false, blocks: [{ open: v.open, close: v.close }] };
    } else {
      out[d.key] = { closed: true, blocks: [] };
    }
  }
  return out;
}

export function ScheduleEditor({
  value,
  onChange,
}: {
  value: WeekSchedule;
  onChange: (next: WeekSchedule) => void;
}) {
  const [copyFromOpen, setCopyFromOpen] = useState<string | null>(null);

  function toggleClosed(dayKey: string) {
    const cur = value[dayKey] ?? { closed: true, blocks: [] };
    if (cur.closed) {
      onChange({ ...value, [dayKey]: { closed: false, blocks: [DEFAULT_BLOCK] } });
    } else {
      onChange({ ...value, [dayKey]: { closed: true, blocks: [] } });
    }
  }

  function updateBlock(dayKey: string, idx: number, patch: Partial<Block>) {
    const cur = value[dayKey] ?? { closed: false, blocks: [] };
    const newBlocks = cur.blocks.map((b, i) => (i === idx ? { ...b, ...patch } : b));
    onChange({ ...value, [dayKey]: { closed: false, blocks: newBlocks } });
  }

  function addBlock(dayKey: string) {
    const cur = value[dayKey] ?? { closed: false, blocks: [] };
    const last = cur.blocks[cur.blocks.length - 1];
    const newBlock: Block = last
      ? { open: addMinutes(last.close, 60), close: addMinutes(last.close, 60 * 4) }
      : DEFAULT_BLOCK;
    onChange({ ...value, [dayKey]: { closed: false, blocks: [...cur.blocks, newBlock] } });
  }

  function removeBlock(dayKey: string, idx: number) {
    const cur = value[dayKey] ?? { closed: false, blocks: [] };
    const newBlocks = cur.blocks.filter((_, i) => i !== idx);
    onChange({
      ...value,
      [dayKey]: { closed: newBlocks.length === 0, blocks: newBlocks },
    });
  }

  function copyFromDay(sourceKey: string, targetKey: string) {
    const src = value[sourceKey];
    if (!src) return;
    onChange({ ...value, [targetKey]: { closed: src.closed, blocks: src.blocks.map((b) => ({ ...b })) } });
  }

  function applyToWeekdays(sourceKey: string) {
    const src = value[sourceKey];
    if (!src) return;
    const next = { ...value };
    for (const d of DAYS.slice(0, 5)) {
      next[d.key] = { closed: src.closed, blocks: src.blocks.map((b) => ({ ...b })) };
    }
    onChange(next);
    setCopyFromOpen(null);
  }

  function applyToAll(sourceKey: string) {
    const src = value[sourceKey];
    if (!src) return;
    const next = { ...value };
    for (const d of DAYS) {
      next[d.key] = { closed: src.closed, blocks: src.blocks.map((b) => ({ ...b })) };
    }
    onChange(next);
    setCopyFromOpen(null);
  }

  return (
    <div className="space-y-2">
      {DAYS.map((d) => {
        const day = value[d.key] ?? { closed: true, blocks: [] };
        const isOpen = copyFromOpen === d.key;
        return (
          <div
            key={d.key}
            className={cn(
              "rounded-xl border bg-card p-3 transition-colors",
              day.closed ? "border-border/40 opacity-70" : "border-border/60",
            )}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleClosed(d.key)}
                className="flex w-28 shrink-0 items-center gap-2"
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-[10px] font-semibold transition-colors",
                    day.closed ? "bg-cream-200 text-cream-700" : "bg-blush-100 text-blush-700",
                  )}
                >
                  {d.short}
                </span>
                <span className="text-sm font-medium tracking-tight">{d.label}</span>
              </button>

              {day.closed ? (
                <span className="text-xs italic text-muted-foreground">Cerrado</span>
              ) : (
                <div className="flex flex-1 flex-wrap items-center gap-1.5">
                  {day.blocks.map((b, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2 py-1"
                    >
                      <Input
                        type="time"
                        step={300}
                        value={b.open}
                        onChange={(e) => updateBlock(d.key, i, { open: e.target.value })}
                        className="h-6 w-[78px] border-0 bg-transparent px-1 text-xs tabular-nums shadow-none focus-visible:bg-card"
                      />
                      <span className="text-xs text-muted-foreground">→</span>
                      <Input
                        type="time"
                        step={300}
                        value={b.close}
                        onChange={(e) => updateBlock(d.key, i, { close: e.target.value })}
                        className="h-6 w-[78px] border-0 bg-transparent px-1 text-xs tabular-nums shadow-none focus-visible:bg-card"
                      />
                      <button
                        type="button"
                        onClick={() => removeBlock(d.key, i)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-card hover:text-destructive"
                      >
                        <Minus className="size-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addBlock(d.key)}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-blush-300 hover:text-blush-600"
                  >
                    <Plus className="size-3" />
                    Bloque
                  </button>
                </div>
              )}

              {!day.closed && (
                <button
                  type="button"
                  onClick={() => setCopyFromOpen(isOpen ? null : d.key)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-blush-50 hover:text-blush-600"
                  title="Copiar a otros días"
                >
                  <Copy className="size-3.5" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-blush-50/60 p-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Copiar a:
                    </span>
                    {DAYS.filter((x) => x.key !== d.key).map((x) => (
                      <button
                        key={x.key}
                        type="button"
                        onClick={() => {
                          copyFromDay(d.key, x.key);
                        }}
                        className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] hover:border-blush-300"
                      >
                        {x.short}
                      </button>
                    ))}
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => applyToWeekdays(d.key)}>
                      Lun-Vie
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => applyToAll(d.key)}>
                      Toda la semana
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
