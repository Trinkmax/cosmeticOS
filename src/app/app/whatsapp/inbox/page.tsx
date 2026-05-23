import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { InboxList } from "./inbox-list";

export default async function WhatsAppInboxPage() {
  await requireTenant();
  const supabase = await createClient();

  const { data: chats } = await supabase
    .from("whatsapp_chats")
    .select("id, contact_name, contact_phone_e164, last_message_at, last_message_preview, unread_count, status, client_id, clients(full_name)")
    .neq("status", "spam")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(200);

  return (
    <div className="grid h-[calc(100dvh-3.5rem)] grid-cols-1 md:h-[calc(100dvh-4rem)] md:grid-cols-[320px_1fr]">
      <aside className="overflow-y-auto border-r border-border/60 bg-card/30">
        {(chats ?? []).length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={MessageCircle}
              title="Sin conversaciones"
              description="Cuando alguien escriba a tu número conectado, aparecerá acá."
              action={
                <Button asChild variant="brand" size="sm">
                  <Link href="/app/whatsapp/setup">Configurar WhatsApp</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <InboxList chats={chats ?? []} />
        )}
      </aside>

      <main className="hidden place-items-center bg-muted/20 md:grid">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="mx-auto size-10 opacity-30" />
          <p className="mt-3 text-sm">Elegí una conversación a la izquierda.</p>
        </div>
      </main>
    </div>
  );
}
