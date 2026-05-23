import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./signup-form";
import { FadeIn } from "@/components/motion/primitives";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  return (
    <FadeIn>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Creá tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Empezá gratis. Sin tarjeta. En 60 segundos tenés cosmeticOS andando.
        </p>
      </div>

      <div className="mt-8">
        <SignupForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </FadeIn>
  );
}
