"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type SignupState } from "./actions";

export function SignupForm() {
  const [state, submit] = useActionState<SignupState, FormData>(signupAction, null);
  const [show, setShow] = useState(false);

  if (state?.ok && state.needsVerification) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium">Te enviamos un correo para confirmar.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisá tu bandeja y hacé click en el link para activar tu cuenta.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Tu nombre</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" placeholder="María Pérez" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            minLength={8}
            required
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Ocultar" : "Mostrar"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {state && !state.ok ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </motion.div>
      ) : null}

      <SubmitButton />

      <p className="text-center text-xs text-muted-foreground">
        Al continuar aceptás nuestros términos y la política de privacidad.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" variant="brand" loading={pending}>
      Crear cuenta
    </Button>
  );
}
