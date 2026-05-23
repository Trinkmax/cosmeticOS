import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTenant } from "@/lib/auth/session";
import { DAYS, emptyWeek, type WeekSchedule } from "@/components/app/schedule-editor";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireTenant();
  const { id } = await params;
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("professional_schedules")
    .select("weekday, start_time, end_time")
    .eq("professional_id", id)
    .order("weekday")
    .order("start_time");

  const week = emptyWeek();
  for (const r of rows ?? []) {
    const day = DAYS.find((d) => d.weekday === r.weekday);
    if (!day) continue;
    const cur = week[day.key]!;
    cur.closed = false;
    cur.blocks.push({
      open: r.start_time.slice(0, 5),
      close: r.end_time.slice(0, 5),
    });
  }

  return NextResponse.json(week satisfies WeekSchedule);
}
