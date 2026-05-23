import Link from "next/link";
import { ArrowLeft, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";

export default function WhatsAppSetupPage() {
  return (
    <>
      <PageHeader
        title="Conectar WhatsApp"
        description="Elegí cómo querés enviar y recibir mensajes."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/whatsapp">
              <ArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                <ShieldCheck className="size-4" />
              </span>
              <h3 className="font-semibold">Meta Cloud API</h3>
              <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                Oficial
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Línea registrada con Meta. Plantillas aprobadas, campañas masivas, sin riesgo de baneo.
              Necesitás una cuenta Business y un número que no esté en WhatsApp Personal.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              <li>· Plantillas aprobadas para enviar fuera de las 24h</li>
              <li>· Campañas masivas seguras</li>
              <li>· Costo por conversación según Meta</li>
            </ul>
            <Button className="mt-5 w-full" variant="brand" disabled>
              Conectar (Embedded Signup) · próximamente
            </Button>
          </article>

          <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                <QrCode className="size-4" />
              </span>
              <h3 className="font-semibold">Baileys</h3>
              <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
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
            <Button className="mt-5 w-full" variant="outline" disabled>
              Escanear QR · próximamente
            </Button>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Estado actual:</strong> el schema de WhatsApp está completo (sesiones, chats, mensajes, plantillas, campañas, automatizaciones, webhooks). La Edge Function <code className="rounded bg-muted px-1.5 py-0.5">whatsapp-webhook</code> ya recibe payloads de Meta. La UI de inbox y la integración del Embedded Signup están planificadas para la próxima iteración.
        </div>
      </div>
    </>
  );
}
