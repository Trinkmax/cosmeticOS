import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireTenant();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: stats }, { data: health }, { data: upcoming }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, full_name, phone_e164, email, tags, birth_date, gender, dni, notes, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("v_client_stats").select("*").eq("client_id", id).maybeSingle(),
    supabase
      .from("client_health_info")
      .select("allergies, has_critical_alerts")
      .eq("client_id", id)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select("id, starts_at, status, total_cents")
      .eq("client_id", id)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(5),
  ]);

  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    ...client,
    has_critical_alerts: health?.has_critical_alerts ?? false,
    allergies: health?.allergies ?? null,
    completed_appointments: stats?.completed_appointments ?? 0,
    no_show_count: stats?.no_show_count ?? 0,
    total_spent_cents: stats?.total_spent_cents ?? 0,
    active_packages: stats?.active_packages ?? 0,
    upcoming: upcoming ?? [],
  });
}
