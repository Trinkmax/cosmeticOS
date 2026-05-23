"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { loginAction, magicLinkAction, type LoginState } from "./actions";

export function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError: string | null;
}) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [pwdState, pwdSubmit] = useActionState<LoginState, FormData>(
    loginAction,
    initialError ? { ok: false, error: initialError } : null,
  );
  const [magicState, magicSubmit] = useActionState<LoginState, FormData>(magicLinkAction, null);

  if (magicState?.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium">Te enviamos un link.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisá tu correo y hacé click en el botón para entrar.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "password" ? (
          <motion.form
            key="pwd"
            action={pwdSubmit}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <input type="hidden" name="next" value={nextPath} />

            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <button
                  type="button"
                  onClick={() => toast.info("Función pronto")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ¿Olvidaste?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {pwdState && !pwdState.ok ? <ErrorBanner message={pwdState.error} /> : null}

            <SubmitButton>Entrar</SubmitButton>
          </motion.form>
        ) : (
          <motion.form
            key="magic"
            action={magicSubmit}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="magic-email">Correo</Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
              />
              <p className="text-xs text-muted-foreground">
                Te enviamos un link de un solo uso, sin contraseña.
              </p>
            </div>

            {magicState && !magicState.ok ? <ErrorBanner message={magicState.error} /> : null}

            <SubmitButton>
              <Mail className="size-4" />
              Enviarme el link
            </SubmitButton>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
      >
        {mode === "password" ? "Entrar con link mágico" : "Entrar con contraseña"}
      </Button>
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" variant="brand" loading={pending}>
      {children}
    </Button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}
