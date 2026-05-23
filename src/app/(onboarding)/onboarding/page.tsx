import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { OnboardingWizard } from "./wizard";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Configurá tu cuenta" };

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/onboarding");
  if (session.currentTenantId) redirect("/app");

  return (
    <div className="mx-auto max-w-2xl">
      <OnboardingWizard defaultEmail={session.user.email ?? ""} />
    </div>
  );
}
