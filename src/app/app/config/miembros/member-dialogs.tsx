"use client";

import { useState, useTransition } from "react";
import { Ban, Mail, MoreHorizontal, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { inviteMemberAction, updateMemberRoleAction, disableMemberAction } from "../actions";

type Role = "owner" | "admin" | "reception" | "professional" | "advisor";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("reception");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await inviteMemberAction({ email, role });
      if (r.ok) {
        toast.success("Invitación creada");
        setOpen(false);
        setEmail("");
        navigator.clipboard.writeText(
          `${window.location.origin}/invite/${r.data.token}`,
        ).catch(() => {});
        toast.message("Link copiado al portapapeles");
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <UserPlus />
          Invitar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar miembro</DialogTitle>
          <DialogDescription>Te damos un link para compartir.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-soft"
            >
              <option value="admin">Admin · todo menos cuenta/plan</option>
              <option value="reception">Recepción · turnos, clientes, caja</option>
              <option value="professional">Profesional · solo lo suyo</option>
              <option value="advisor">Asesora · reseñas + campañas</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" variant="brand" loading={pending}>
              <Mail />
              Crear invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MemberRowActions({ memberId, currentRole }: { memberId: string; currentRole: string }) {
  const [pending, startTransition] = useTransition();
  const roles: Role[] = ["admin", "reception", "professional", "advisor"];
  if (currentRole === "owner") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
        {roles.map((r) => (
          <DropdownMenuItem
            key={r}
            disabled={pending || r === currentRole}
            onClick={() => {
              startTransition(async () => {
                const res = await updateMemberRoleAction(memberId, r);
                if (res.ok) toast.success("Rol actualizado");
                else toast.error(res.error);
              });
            }}
          >
            {r}
            {r === currentRole && " ✓"}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onClick={() => {
            if (!confirm("¿Deshabilitar este miembro?")) return;
            startTransition(async () => {
              const res = await disableMemberAction(memberId);
              if (res.ok) toast.success("Miembro deshabilitado");
              else toast.error(res.error);
            });
          }}
        >
          <Ban />
          Deshabilitar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
