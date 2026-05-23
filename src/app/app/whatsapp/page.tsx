import Link from "next/link";
import { MessageCircle, Phone, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

export default async function WhatsAppPage() {
  await requireTenant();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("whatsapp_sessions")
    .select("id, display_name, provider, status, display_phone_e164, last_seen_at")
    .order("created_at", { ascending: false });

  const connected = (sessions ?? []).find((s) => s.status === "connected");

  return (
    <>
      <PageHeader
        title="WhatsApp"
        description="Centralizá la conversación con tus clientas. Meta Cloud API (oficial) o Baileys (no oficial)."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/app/whatsapp/setup">
                <Settings2 />
                {connected ? "Configurar" : "Conectar"}
              </Link>
            </Button>
            <Button asChild variant="brand">
              <Link href="/app/whatsapp/inbox">
                <MessageCircle />
                Bandeja
              </Link>
            </Button>
          </>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8">
        {!sessions || sessions.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Conectá tu WhatsApp"
            description="Elegí Meta Cloud API (oficial, recomendado para negocios) o Baileys (conecta tu número personal escaneando un QR)."
            action={
              <Button asChild variant="brand" size="sm">
                <Link href="/app/whatsapp/setup">Empezar</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Phone className="size-4" />
                Sesiones
              </h3>
              <ul className="space-y-2">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <div>
                      <div className="font-medium">{s.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.display_phone_e164 ?? "Sin número"} · {s.provider}
                      </div>
                    </div>
                    <Badge variant={s.status === "connected" ? "success" : "soft"}>{s.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Sparkles className="size-4" />
                Bandeja
              </h3>
              <p className="text-sm text-muted-foreground">
                La bandeja compartida con tus chats llegará en la próxima iteración.
                Por ahora, el schema ya guarda mensajes que reciben los webhooks.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
