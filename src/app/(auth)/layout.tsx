import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/app/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Mobile: gradient mesh sutil de fondo */}
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50 lg:hidden" />

      <div className="relative flex items-center justify-center p-5 lg:bg-background lg:p-6">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:mb-10"
            aria-label="cosmeticOS — Inicio"
          >
            <Logo priority className="h-7 w-auto" />
          </Link>
          {children}
        </div>
      </div>

      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/spa-interior.png"
          alt="cosmeticOS Spa"
          fill
          sizes="50vw"
          priority
          className="object-cover transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blush-700/80 via-peach-600/75 to-lavender-700/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
          <div className="opacity-90">
            <Sparkles className="size-8" />
          </div>
          <blockquote className="space-y-4">
            <p className="text-pretty text-2xl font-medium leading-snug">
              &ldquo;Antes anotaba en papel. Hoy mi equipo entra, ve la agenda, cierra caja
              y nadie se pelea con el WhatsApp.&rdquo;
            </p>
            <footer className="text-sm opacity-80">— Romina, dueña de estética en Palermo</footer>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}
