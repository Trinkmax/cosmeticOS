import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/r"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip refresh for asset routes (extra safety on top of matcher)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isPublicReservation = pathname.startsWith("/r/");
  const isPublicRoute =
    isPublicReservation ||
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    isAuthRoute;

  // Logged-in users hitting auth routes → bounce to /app
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Anonymous users hitting protected routes → bounce to /login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif|woff|woff2)$).*)",
  ],
};
