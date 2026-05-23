import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db/types";

/**
 * Refreshes the user's session cookies on every navigation.
 * Called from /src/proxy.ts (Next.js 16 proxy convention).
 *
 * Returns { response, user } — caller decides what to do with `user`
 * (e.g. redirect to /login when null on a protected route).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: getUser() forces a JWT verification against GoTrue, refreshing
  // the access token if needed. Do NOT replace with getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
