import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { InboxList } from "../inbox-list";
import { ChatWindow } from "./chat-window";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  await requireTenant();
  const { chatId } = await params;
  const supabase = await createClient();

  const [{ data: chat }, { data: chats }, { data: messages }] = await Promise.all([
    supabase
      .from("whatsapp_chats")
      .select("id, tenant_id, contact_name, contact_phone_e164, status, client_id, unread_count, clients(id, full_name, phone_e164)")
      .eq("id", chatId)
      .maybeSingle(),
    supabase
      .from("whatsapp_chats")
      .select("id, contact_name, contact_phone_e164, last_message_at, last_message_preview, unread_count, status, client_id, clients(full_name)")
      .neq("status", "spam")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase
      .from("whatsapp_messages")
      .select("id, direction, kind, body, media_url, status, sent_at, received_at, created_at, is_automated")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  if (!chat) notFound();

  return (
    <div className="grid h-[calc(100dvh-3.5rem)] grid-cols-1 md:h-[calc(100dvh-4rem)] md:grid-cols-[320px_1fr]">
      <aside className="hidden overflow-y-auto border-r border-border/60 bg-card/30 md:block">
        {(chats ?? []).length === 0 ? (
          <div className="p-6">
            <EmptyState icon={MessageCircle} title="Sin conversaciones" />
          </div>
        ) : (
          <InboxList chats={chats ?? []} />
        )}
      </aside>

      <ChatWindow chat={chat} initialMessages={messages ?? []} />
    </div>
  );
}
