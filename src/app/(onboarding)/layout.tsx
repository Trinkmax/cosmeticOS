import { Sparkles } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-60" />
      <header className="container mx-auto flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-blush-400 to-peach-400 text-white shadow-blush">
            <Sparkles className="size-4" />
          </span>
          cosmetic<span className="text-brand-600">OS</span>
        </div>
      </header>
      <main className="container mx-auto px-6 pb-16">{children}</main>
    </div>
  );
}
