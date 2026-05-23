"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Bot, Check, CheckCheck, Loader2, MoreHorizontal, Phone, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatPhone, initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessageAction,
  setChatStatusAction,
  markChatReadAction,
} from "../actions";

type Chat = {
  id: string;
  tenant_id: string;
  contact_name: string | null;
  contact_phone_e164: string;
  status: string;
  client_id: string | null;
  unread_count: number;
  clients: { id: string; full_name: string; phone_e164: string | null } | null;
};

type Message = {
  id: string;
  direction: "in" | "out";
  kind: string;
  body: string | null;
  media_url: string | null;
  status: string;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  is_automated: boolean;
};

export function ChatWindow({
  chat,
  initialMessages,
}: {
  chat: Chat;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const name = chat.clients?.full_name ?? chat.contact_name ?? formatPhone(chat.contact_phone_e164);

  // Mark as read on mount
  useEffect(() => {
    if (chat.unread_count > 0) {
      markChatReadAction(chat.id).catch(() => {});
    }
  }, [chat.id, chat.unread_count]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chat.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "whatsapp_messages", filter: `chat_id=eq.${chat.id}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "whatsapp_messages", filter: `chat_id=eq.${chat.id}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => prev.map((p) => (p.id === m.id ? { ...p, ...m } : p)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.id]);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || pending) return;
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      direction: "out",
      kind: "text",
      body: text,
      media_url: null,
      status: "queued",
      sent_at: null,
      received_at: null,
      created_at: new Date().toISOString(),
      is_automated: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    const body = text;
    setText("");
    startTransition(async () => {
      const res = await sendMessageAction({ chat_id: chat.id, body });
      if (!res.ok) {
        toast.error(res.error);
        setMessages((prev) => prev.filter((p) => p.id !== optimistic.id));
        setText(body);
      } else {
        setMessages((prev) => prev.filter((p) => p.id !== optimistic.id));
      }
    });
  }

  return (
    <main className="flex h-full flex-col bg-gradient-to-b from-cream-50 via-cream-100/40 to-cream-50">
      <header className="flex items-center gap-2 border-b border-border/60 bg-card/80 px-3 py-3 backdrop-blur md:gap-3 md:px-6">
        <Link
          href="/app/whatsapp/inbox"
          className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-blush-100/60 md:hidden"
          aria-label="Volver a la lista"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Avatar className="size-10 shrink-0">
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium tracking-tight">{name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="size-3" />
            {formatPhone(chat.contact_phone_e164)}
            <Badge variant="soft" className="ml-2 text-[10px]">{chat.status}</Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={async () => {
              const r = await setChatStatusAction(chat.id, chat.status === "closed" ? "open" : "closed");
              if (!r.ok) toast.error(r.error);
              else toast.success("Estado actualizado");
            }}>
              {chat.status === "closed" ? "Reabrir conversación" : "Cerrar conversación"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              const r = await setChatStatusAction(chat.id, "spam");
              if (!r.ok) toast.error(r.error);
              else toast.success("Marcado como spam");
            }}>
              Marcar como spam
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-muted-foreground">
            <div>
              <Sparkles className="mx-auto size-6 opacity-30" />
              <p className="mt-2 text-sm">Decile algo lindo.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const sameDay = prev && new Date(prev.created_at).toDateString() === new Date(m.created_at).toDateString();
                return (
                  <li key={m.id}>
                    {!sameDay && (
                      <div className="my-4 flex justify-center">
                        <span className="rounded-full bg-cream-100 px-3 py-1 text-[11px] tracking-tight text-cream-700">
                          {new Date(m.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
                        </span>
                      </div>
                    )}
                    <MessageBubble m={m} />
                  </li>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border/60 bg-card/80 px-4 py-3 backdrop-blur md:px-6"
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          placeholder="Escribí un mensaje…"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm shadow-soft focus:outline-none"
        />
        <Button type="submit" variant="brand" size="icon" disabled={!text.trim() || pending} className="size-10">
          {pending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </main>
  );
}

function MessageBubble({ m }: { m: Message }) {
  const out = m.direction === "out";
  const time = new Date(m.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("flex", out ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "group max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-soft",
          out
            ? "bg-gradient-to-br from-blush-400 to-peach-400 text-white"
            : "bg-card border border-border/60 text-foreground",
        )}
      >
        {m.is_automated && (
          <div className={cn("mb-1 flex items-center gap-1 text-[10px]", out ? "text-white/80" : "text-muted-foreground")}>
            <Bot className="size-3" /> Automático
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{m.body ?? `[${m.kind}]`}</p>
        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", out ? "text-white/80" : "text-muted-foreground")}>
          <span className="tabular-nums">{time}</span>
          {out && <Status status={m.status} />}
        </div>
      </div>
    </motion.div>
  );
}

function Status({ status }: { status: string }) {
  if (status === "read") return <CheckCheck className="size-3.5 text-emerald-200" />;
  if (status === "delivered") return <CheckCheck className="size-3.5 opacity-80" />;
  if (status === "sent") return <Check className="size-3.5 opacity-80" />;
  if (status === "queued") return <Loader2 className="size-3 animate-spin opacity-80" />;
  if (status === "failed") return <span className="text-red-200">!</span>;
  return null;
}
