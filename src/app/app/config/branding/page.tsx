import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { BrandingForm } from "./branding-form";

export default async function BrandingPage() {
  const session = await requireAdmin();
  const supabase = await createClient();
  const [{ data: settings }, { data: tenant }] = await Promise.all([
    supabase
      .from("tenant_settings")
      .select("branding, google_review_url, booking_link_enabled")
      .eq("tenant_id", session.currentTenantId)
      .maybeSingle(),
    supabase.from("tenants").select("slug").eq("id", session.currentTenantId).maybeSingle(),
  ]);

  return (
    <>
      <PageHeader
        title="Branding"
        description="Cómo te ven los clientes."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/config">
              <ArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      <div className="container mx-auto max-w-2xl px-4 py-8 md:px-8">
        <BrandingForm
          initialLogo={(settings?.branding as { logo_url?: string })?.logo_url ?? ""}
          initialColor={(settings?.branding as { primary_color?: string })?.primary_color ?? "#f9b8c1"}
          initialReviewUrl={settings?.google_review_url ?? ""}
          initialBookingEnabled={settings?.booking_link_enabled ?? false}
          tenantSlug={tenant?.slug ?? ""}
        />
      </div>
    </>
  );
}
