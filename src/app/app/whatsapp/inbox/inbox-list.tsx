"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatPhone, initials } from "@/lib/utils";

type Chat = {
  id: string;
  contact_name: string | null;
  contact_phone_e164: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  status: string;
  client_id: string | null;
  clients: { full_name: string } | null;
};

export function InboxList({ chats }: { chats: Chat[] }) {
  const params = useParams<{ chatId?: string }>();
  const activeId = params.chatId;

  return (
    <ul className="divide-y divide-border/40">
      {chats.map((c) => {
        const name = c.clients?.full_name ?? c.contact_name ?? formatPhone(c.contact_phone_e164);
        const active = activeId === c.id;
        return (
          <li key={c.id}>
            <Link
              href={`/app/whatsapp/inbox/${c.id}`}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-blush-50/60",
                active && "bg-blush-100/60",
              )}
            >
              {active && (
                <motion.span
                  layoutId="chat-active"
                  className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-blush-500"
                />
              )}
              <Avatar className="size-10 shrink-0">
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium tracking-tight">{name}</div>
                  {c.last_message_at && (
                    <div className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                      {formatRelative(c.last_message_at)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="truncate text-xs text-muted-foreground">
                    {c.last_message_preview ?? "—"}
                  </div>
                  {c.unread_count > 0 && (
                    <Badge variant="default" className="ml-auto h-5 min-w-5 justify-center px-1.5 text-[10px]">
                      {c.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = (now.getTime() - d.getTime()) / 60000;
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${Math.floor(diffMin)}m`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h`;
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}
