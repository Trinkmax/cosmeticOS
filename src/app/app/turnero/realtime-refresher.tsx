"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Suscribe a cambios de appointments del tenant actual y refresca la página.
 * Throttled para evitar refresh-storm si llegan muchos cambios juntos.
 */
export function RealtimeRefresher() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    function scheduleRefresh() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        startTransition(() => router.refresh());
      }, 250);
    }

    const channel = supabase
      .channel("turnero-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment_services" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment_professionals" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment_rooms" }, scheduleRefresh)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
