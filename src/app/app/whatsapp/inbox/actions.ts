"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { env } from "@/lib/env";

export type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

export async function sendMessageAction(input: {
  chat_id: string;
  body: string;
}): Promise<Result<{ message_id: string }>> {
  await requireTenant();
  if (!input.body.trim()) return { ok: false, error: "Mensaje vacío" };

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "Sin sesión" };

  // Invoke the whatsapp-send Edge Function with user's JWT
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      chat_id: input.chat_id,
      body: input.body,
    }),
  });
  const data = (await res.json()) as { ok: boolean; message_id?: string; error?: string };
  if (!data.ok || !data.message_id) return { ok: false, error: data.error ?? "No se pudo enviar" };

  revalidatePath(`/app/whatsapp/inbox/${input.chat_id}`);
  return { ok: true, data: { message_id: data.message_id } };
}

export async function markChatReadAction(chatId: string): Promise<void> {
  await requireTenant();
  const supabase = await createClient();
  await supabase.from("whatsapp_chats").update({ unread_count: 0 }).eq("id", chatId);
  revalidatePath("/app/whatsapp/inbox");
}

export async function assignChatAction(chatId: string, memberId: string | null): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase
    .from("whatsapp_chats")
    .update({ assigned_to_member_id: memberId })
    .eq("id", chatId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/whatsapp/inbox/${chatId}`);
  return { ok: true, data: undefined };
}

export async function setChatStatusAction(
  chatId: string,
  status: "open" | "closed" | "snoozed" | "spam",
): Promise<Result> {
  await requireTenant();
  const supabase = await createClient();
  const { error } = await supabase.from("whatsapp_chats").update({ status }).eq("id", chatId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/whatsapp/inbox");
  return { ok: true, data: undefined };
}
