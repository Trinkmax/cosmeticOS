"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { EditLocationDialog } from "./location-dialog";
import { normalizeWeek, DAYS } from "@/components/app/schedule-editor";

type Location = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  province: string | null;
  timezone: string | null;
  phone_e164: string | null;
  email: string | null;
  is_active: boolean;
  is_default: boolean;
  opening_hours: unknown;
};

export function LocationsGrid({ locations }: { locations: Location[] }) {
  const [editing, setEditing] = useState<Location | null>(null);

  return (
    <>
      <Stagger className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {locations.map((l) => {
          const hours = normalizeWeek(l.opening_hours);
          const today = DAYS.find((d) => d.weekday === new Date().getDay());
          const todayHours = today ? hours[today.key] : null;

          return (
            <StaggerItem key={l.id}>
              <button
                onClick={() => setEditing(l)}
                className="flex h-full w-full flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 text-left shadow-soft transition-all hover:border-blush-300/60 hover:shadow-card hover:-translate-y-0.5"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium tracking-tight">{l.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{l.address}{l.city ? ` · ${l.city}` : ""}</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {l.is_default && <Badge variant="default" className="text-[10px]">Default</Badge>}
                    {!l.is_active && <Badge variant="soft" className="text-[10px]">Inactiva</Badge>}
                  </div>
                </div>

                {todayHours && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="size-3 text-muted-foreground" />
                    {todayHours.closed ? (
                      <span className="italic text-muted-foreground">Cerrado hoy</span>
                    ) : (
                      <span className="tabular-nums text-foreground/80">
                        {todayHours.blocks.map((b) => `${b.open}–${b.close}`).join(" · ")}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex w-full flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  {l.phone_e164 && <span className="tabular-nums">{l.phone_e164}</span>}
                  {l.email && <span className="truncate">{l.email}</span>}
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>

      <AnimatePresence>
        {editing && (
          <EditLocationDialog
            location={editing}
            open
            onOpenChange={(v) => !v && setEditing(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
