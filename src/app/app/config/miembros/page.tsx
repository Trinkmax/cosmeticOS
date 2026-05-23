import Link from "next/link";
import { ArrowLeft, Mail, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { initials } from "@/lib/utils";
import { InviteMemberDialog, MemberRowActions } from "./member-dialogs";

const ROLE_LABEL = {
  owner: "Dueña",
  admin: "Admin",
  reception: "Recepción",
  professional: "Profesional",
  advisor: "Asesora",
} as const;

export default async function MiembrosPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: rawMembers }, { data: invitations }] = await Promise.all([
    supabase
      .from("members")
      .select("id, user_id, invited_email, role, status, created_at")
      .neq("status", "disabled")
      .order("created_at"),
    supabase
      .from("invitations")
      .select("id, email, role, expires_at, accepted_at, created_at")
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const userIds = (rawMembers ?? []).map((m) => m.user_id).filter((id): id is string => !!id);
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, avatar_url, phone_e164").in("id", userIds)
    : { data: [] as Array<{ id: string; full_name: string | null; avatar_url: string | null; phone_e164: string | null }> };
  const profMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  const members = (rawMembers ?? []).map((m) => ({
    ...m,
    profiles: m.user_id ? profMap.get(m.user_id) ?? null : null,
  }));

  return (
    <>
      <PageHeader
        title="Miembros"
        description="Quién entra a la cuenta y qué puede hacer."
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/config">
                <ArrowLeft />
                Volver
              </Link>
            </Button>
            <InviteMemberDialog />
          </>
        }
      />

      <div className="container mx-auto px-4 py-6 md:px-8 space-y-8">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activos</h2>
          {members.length === 0 ? (
            <EmptyState icon={Users} title="Sin miembros" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-cream-100/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Miembro</th>
                    <th className="px-4 py-3 text-left">Rol</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>{initials(m.profiles?.full_name ?? m.invited_email ?? "?")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{m.profiles?.full_name ?? m.invited_email ?? "—"}</div>
                            {m.profiles?.phone_e164 && (
                              <div className="text-xs text-muted-foreground tabular-nums">{m.profiles.phone_e164}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{ROLE_LABEL[m.role as keyof typeof ROLE_LABEL]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={m.status === "active" ? "success" : "soft"}>{m.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MemberRowActions memberId={m.id} currentRole={m.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {(invitations ?? []).length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invitaciones pendientes</h2>
            <ul className="space-y-2">
              {invitations!.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-xl border border-dashed border-border bg-card/60 p-3">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{i.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Rol: {ROLE_LABEL[i.role as keyof typeof ROLE_LABEL]} · vence {new Date(i.expires_at).toLocaleDateString("es-AR")}
                      </div>
                    </div>
                  </div>
                  <Badge variant="warning">Pendiente</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
