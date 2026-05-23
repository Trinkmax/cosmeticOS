"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Ingresá un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  next: z.string().optional(),
});

const magicSchema = z.object({
  email: z.string().email("Ingresá un correo válido"),
});

export type LoginState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: traduceError(error.message) };
  }

  redirect(parsed.data.next ?? "/app");
}

export async function magicLinkAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = magicSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email inválido" };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/app` },
  });
  if (error) return { ok: false, error: traduceError(error.message) };
  return { ok: true };
}

function traduceError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Tu correo aún no está verificado.";
  if (m.includes("rate limit")) return "Demasiados intentos. Esperá un momento.";
  return msg;
}
