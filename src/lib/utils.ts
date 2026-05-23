import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number, currency = "ARS", locale = "es-AR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPhone(e164?: string | null): string {
  if (!e164) return "";
  // +5491155551234 → +54 9 11 5555-1234 (simple para AR)
  const match = e164.match(/^\+54(9)?(\d{2,4})(\d{4})(\d{4})$/);
  if (match) {
    const [, mobile, area, mid, end] = match;
    return `+54 ${mobile ?? ""}${mobile ? " " : ""}${area} ${mid}-${end}`.trim();
  }
  return e164;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
