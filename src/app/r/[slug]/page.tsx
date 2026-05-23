import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "./booking-flow";

type Params = Promise<{ slug: string }>;

type BookingInfo = {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  timezone: string;
  currency: string;
  logo_url: string | null;
  primary_color: string;
  services: Array<{
    id: string;
    name: string;
    duration_minutes: number;
    price_cents: number;
    color: string | null;
    description: string | null;
    category_id: string | null;
    category_name: string | null;
  }>;
  professionals: Array<{ id: string; name: string; color: string | null; avatar_url: string | null; bio: string | null }>;
  locations: Array<{ id: string; name: string; address: string | null; is_default: boolean }>;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_get_booking_info", { _slug: slug });
  const info = data as BookingInfo | null;
  if (!info) return { title: "Reservar" };
  return {
    title: `Reservar en ${info.tenant_name}`,
    description: `Elegí tu servicio y horario en ${info.tenant_name}.`,
  };
}

export default async function PublicBookingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_get_booking_info", { _slug: slug });
  const info = data as BookingInfo | null;

  if (!info) notFound();
  if (info.locations.length === 0 || info.professionals.length === 0 || info.services.length === 0) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{info.tenant_name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este negocio todavía no completó la configuración de su link público. Por favor, contactalos por otro canal.
          </p>
        </div>
      </main>
    );
  }

  return <BookingFlow info={info} />;
}
