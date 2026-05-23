"use client";

import { useState, useTransition } from "react";
import { Copy, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBrandingAction } from "../actions";

const PALETTE = ["#f9b8c1", "#fbc592", "#fde2a7", "#c9e4d4", "#bdd4f0", "#d8c4eb", "#8b5cf6", "#06b6d4"];

export function BrandingForm({
  initialLogo,
  initialColor,
  initialReviewUrl,
  initialBookingEnabled,
  tenantSlug,
}: {
  initialLogo: string;
  initialColor: string;
  initialReviewUrl: string;
  initialBookingEnabled: boolean;
  tenantSlug: string;
}) {
  const [logo, setLogo] = useState(initialLogo);
  const [color, setColor] = useState(initialColor);
  const [reviewUrl, setReviewUrl] = useState(initialReviewUrl);
  const [bookingEnabled, setBookingEnabled] = useState(initialBookingEnabled);
  const [pending, startTransition] = useTransition();

  const bookingUrl = typeof window !== "undefined" ? `${window.location.origin}/r/${tenantSlug}` : `/r/${tenantSlug}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await updateBrandingAction({
        logo_url: logo || null,
        primary_color: color,
        google_review_url: reviewUrl || null,
        booking_link_enabled: bookingEnabled,
      });
      if (r.ok) toast.success("Branding guardado");
      else toast.error(r.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-medium tracking-tight">Identidad visual</h3>
        <div className="space-y-1.5">
          <Label>URL del logo</Label>
          <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Color primario</Label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-9 rounded-full transition-transform ${
                  c === color ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-medium tracking-tight">Reseñas Google</h3>
        <div className="space-y-1.5">
          <Label>URL pública de Google Reviews</Label>
          <Input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://g.page/r/..." />
          <p className="text-xs text-muted-foreground">Los clientes que dan 5★ son redirigidos acá.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-medium tracking-tight">Link público de reservas</h3>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/50">
          <input
            type="checkbox"
            checked={bookingEnabled}
            onChange={(e) => setBookingEnabled(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="text-sm">Habilitar reservas online en tu link público</span>
        </label>
        {bookingEnabled && (
          <div className="flex items-center gap-2 rounded-lg bg-cream-100 px-3 py-2 text-sm">
            <code className="flex-1 truncate tracking-tight">{bookingUrl}</code>
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => { navigator.clipboard.writeText(bookingUrl); toast.success("Copiado"); }}>
              <Copy />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" asChild>
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
              </a>
            </Button>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <Button type="submit" variant="brand" loading={pending}>
          <Save />
          Guardar
        </Button>
      </div>
    </form>
  );
}
