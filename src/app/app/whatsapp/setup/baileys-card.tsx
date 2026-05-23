"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function BaileysCard({ workerConfigured }: { workerConfigured: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-peach-300 to-blush-300 text-white">
          <QrCode className="size-4" />
        </span>
        <h3 className="font-semibold tracking-tight">Baileys</h3>
        <span className="ml-auto rounded-full bg-peach-100 px-2 py-0.5 text-[10px] font-medium text-peach-700">
          No oficial
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Conectás tu número personal o de la estética escaneando un QR. Funciona como WhatsApp Web.
        Gratis, pero sujeto a baneos si te pasás con el volumen.
      </p>
      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        <li>· Sin trámite con Meta</li>
        <li>· Ideal para volúmenes bajos / conversaciones 1-a-1</li>
        <li>· Necesita un servicio worker corriendo 24/7</li>
      </ul>

      <Button
        className="mt-5 w-full"
        variant="outline"
        disabled={!workerConfigured}
        onClick={() => setOpen(true)}
      >
        {workerConfigured ? "Escanear QR" : "Worker no configurado"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escanear QR de Baileys</DialogTitle>
            <DialogDescription>
              Abrí WhatsApp en tu celular → Configuración → Dispositivos vinculados → Vincular dispositivo.
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto grid h-56 w-56 place-items-center rounded-2xl border-2 border-dashed border-blush-200 bg-cream-50"
          >
            <div className="text-center">
              <QrCode className="mx-auto size-10 text-blush-400 opacity-60" />
              <p className="mt-2 text-xs text-muted-foreground">
                El QR aparece acá apenas conectes el worker.
              </p>
            </div>
          </motion.div>

          <div className="rounded-lg bg-cream-100 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Estado:</strong> esperando worker. Mirá <code className="rounded bg-card px-1 py-0.5">docs/baileys-worker.md</code> para el contrato HTTP.
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
