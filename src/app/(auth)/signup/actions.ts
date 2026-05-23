"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  fullName: z.string().min(2, "Ingresá tu nombre completo").max(120),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type SignupState =
  | { ok: true; needsVerification: boolean }
  | { ok: false; error: string }
  | null;

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    },
  });

  if (error) {
    return { ok: false, error: traduce(error.message) };
  }

  // Si el proyecto requiere confirmación de email, redirigir a confirmación
  if (!data.session) {
    return { ok: true, needsVerification: true };
  }

  redirect("/onboarding");
}

function traduce(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("user already registered")) return "Ya existe una cuenta con ese correo.";
  if (m.includes("password should be at least")) return "La contraseña es muy corta.";
  return msg;
}
