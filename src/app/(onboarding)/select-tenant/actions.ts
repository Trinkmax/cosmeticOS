"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function switchTenantAction(tenantId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_tenant", {
    _tenant_id: tenantId,
  });
  if (error) throw new Error(error.message);
  await supabase.auth.refreshSession();
  revalidatePath("/", "layout");
  redirect("/app");
}

export async function switchLocationAction(locationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_location", { _location_id: locationId });
  if (error) throw new Error(error.message);
  await supabase.auth.refreshSession();
  revalidatePath("/", "layout");
}
