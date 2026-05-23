import { Logo } from "@/components/app/logo";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-60" />
      <header className="container mx-auto flex h-16 items-center px-6">
        <Logo priority className="h-7 w-auto" />
      </header>
      <main className="container mx-auto px-6 pb-16">{children}</main>
    </div>
  );
}
