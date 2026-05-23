import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { FadeIn } from "@/components/motion/primitives";

export const metadata: Metadata = { title: "Iniciar sesión" };

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next, error } = await searchParams;

  return (
    <FadeIn>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciá sesión</h1>
        <p className="text-sm text-muted-foreground">
          Ingresá tu correo y contraseña para entrar.
        </p>
      </div>

      <div className="mt-8">
        <LoginForm nextPath={next ?? "/app"} initialError={error ?? null} />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </FadeIn>
  );
}
