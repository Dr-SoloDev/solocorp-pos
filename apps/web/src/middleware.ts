/**
 * SoloCorp POS — NextAuth v5 Middleware
 * =========================================
 * Auth guard middleware — protects dashboard routes & redirects to /auth/login
 *
 * Public paths (no auth required):
 *   /auth/*       — login, error pages
 *   /api/*        — API routes (handle auth internally)
 *   /_next/*      — Next.js internals
 *   /manifest.json, /sw.js, /favicon.ico, /icons/* — static/public files
 *
 * @phase 1
 */

import { auth } from "@solocorp/auth";
import { NextResponse } from "next/server";

// ─── Middleware ──────────────────────────────────────────────────────────────

export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  const authSession = req.auth;

  // ─── Public routes (no auth required) ──────────────────────────────────

  // Auth pages (login, error)
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // API routes (they handle their own auth internally)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Static & public files (always accessible)
  const publicPaths = [
    "/manifest.json",
    "/sw.js",
    "/favicon.ico",
  ];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Icon files for PWA
  if (pathname.startsWith("/icons/")) {
    return NextResponse.next();
  }

  // Home page (redirects to login anyway, but allow the root path)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // ─── Protected routes — must be authenticated ─────────────────────────

  if (!authSession) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * Middleware matcher config:
 * Run on every route except Next.js internals and common static files.
 * The handler above decides per-path what to allow/block.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
