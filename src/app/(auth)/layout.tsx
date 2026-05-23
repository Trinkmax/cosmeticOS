import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Mobile: gradient mesh sutil de fondo */}
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50 lg:hidden" />

      <div className="relative flex items-center justify-center p-5 lg:bg-background lg:p-6">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-semibold tracking-tight md:mb-10"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-blush-400 to-peach-400 text-white shadow-blush">
              <Sparkles className="size-4" />
            </span>
            cosmetic<span className="text-brand-600">OS</span>
          </Link>
          {children}
        </div>
      </div>

      <aside className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 bg-gradient-to-br from-blush-500/85 via-peach-400/70 to-lavender-400/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
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
