import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

/**
 * ⚠️ Admin client — BYPASSES RLS. Use only in:
 *   - Edge Functions / webhook handlers that authenticate via shared secret.
 *   - Cron jobs running with a known operator context.
 *   - Migrations / scripts.
 *
 * Never expose this to the browser. Never use it in a Server Component or
 * Server Action unless you have already validated the caller's tenant access.
 */
export function createAdminClient() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Cannot create admin client.",
    );
  }
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
