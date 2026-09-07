import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const authRoutes = ["/login", "/registo", "/recuperar-palavra-passe"];
const publicRoutes = [
  ...authRoutes,
  "/auth/callback",
  "/offline",
  "/manifest.webmanifest",
  "/sw.js",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Immediately bypass static PWA assets, manifest and service worker
  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/offline" ||
    pathname.startsWith("/icons/") ||
    pathname === "/favicon.svg"
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && authRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
