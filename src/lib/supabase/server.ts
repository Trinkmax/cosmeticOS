import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

/**
 * Server-side Supabase client (Server Components, Server Actions, Route Handlers).
 *
 * IMPORTANT: never use this for "trusted" reads of auth state. Always call
 * `supabase.auth.getUser()` — it round-trips the JWT to GoTrue and verifies it.
 * `supabase.auth.getSession()` reads the cookie blindly and is NOT secure server-side.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` may throw when invoked from a Server Component — Next.js
            // disallows cookie mutation there. The proxy.ts handles the refresh
            // flow before the request reaches a Server Component, so this is OK.
          }
        },
      },
    },
  );
}
