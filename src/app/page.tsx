import Link from "next/link";
import { ArrowRight, Calendar, MessageCircle, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/primitives";

const features = [
  {
    icon: Calendar,
    title: "Turnero inteligente",
    desc: "Profesional + cabina en cada turno. Anti-overbooking real. Recordatorios 24h y 2h automáticos.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp CRM",
    desc: "Bandeja compartida. Bot que entiende cuando un cliente quiere turno y lo crea solo.",
  },
  {
    icon: Wallet,
    title: "Caja contable",
    desc: "Ledger inmutable. Cuentas separadas (efectivo, MP, Modo, banco). Cierre con conteo.",
  },
  {
    icon: Sparkles,
    title: "Reseñas inteligentes",
    desc: "5★ van a Google. 3-4★ a un form interno. ≤2★ se vuelven caso CRM para que vos resuelvas.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-70" />

      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-blush-400 to-peach-400 text-white shadow-md">
            <Sparkles className="size-4" />
          </span>
          cosmetic<span className="text-brand-600">OS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm" variant="brand">
            <Link href="/signup">Crear cuenta</Link>
          </Button>
        </div>
      </nav>

      <section className="container mx-auto px-6 pb-24 pt-16 md:pt-28">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Hecho para estéticas que se animan a crecer
          </span>
        </FadeIn>

        <SlideUp delay={0.1} className="mx-auto mt-6 max-w-4xl text-center">
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            El sistema operativo<br />
            <span className="bg-gradient-to-br from-blush-500 via-peach-400 to-lavender-400 bg-clip-text text-transparent">
              de las estéticas.
            </span>
          </h1>
        </SlideUp>

        <SlideUp delay={0.2} className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-pretty text-lg text-muted-foreground md:text-xl">
            Turnos, WhatsApp, caja, paquetes, comisiones y reseñas en un solo lugar.
            Reemplazá la agenda en papel y el Excel sin que tu equipo deje de trabajar.
          </p>
        </SlideUp>

        <SlideUp delay={0.3} className="mt-10 flex justify-center gap-3">
          <Button asChild size="xl" variant="brand">
            <Link href="/signup">
              Empezá gratis
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </SlideUp>

        <Stagger className="mx-auto mt-24 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-soft backdrop-blur transition-all hover:shadow-card hover:-translate-y-0.5">
                <div className="absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-blush-300/20 to-peach-300/20 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blush-400 to-peach-400 text-white shadow-blush">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <footer className="container mx-auto border-t border-border/60 px-6 py-8 text-xs text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} cosmeticOS. Hecho con cariño en Argentina.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacidad</Link>
            <Link href="/terms" className="hover:text-foreground">Términos</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
