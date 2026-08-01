import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasAdminAreaAccess, hasPermission } from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";

const memberPrefixes = [
  "/dashboard",
  "/profile",
  "/library",
  "/api/me",
  "/api/library",
  "/api/library/scores",
  "/api/library/audio",
  "/api/files",
];

const adminPrefixes = ["/admin", "/api/admin"];

function matchPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function permissionForAdminPath(
  pathname: string,
): Permission | Permission[] | "deny" | null {
  if (
    pathname.startsWith("/admin/requests") ||
    pathname.startsWith("/api/admin/membership-requests")
  ) {
    return "ACCESS_REQUEST_MANAGE";
  }
  if (
    pathname.startsWith("/admin/members") ||
    pathname.startsWith("/api/admin/members")
  ) {
    return "MEMBER_MANAGE";
  }
  if (
    pathname.startsWith("/admin/scores") ||
    pathname.startsWith("/admin/audio") ||
    pathname.startsWith("/api/admin/files") ||
    pathname.startsWith("/api/admin/sheets") ||
    pathname.startsWith("/api/admin/audio") ||
    pathname.startsWith("/api/admin/scores")
  ) {
    return "PIECE_MANAGE";
  }
  if (
    pathname.startsWith("/admin/invoices") ||
    pathname.startsWith("/api/admin/invoices")
  ) {
    return "INVOICE_READ";
  }
  // Generic /admin hub: any admin-area permission
  if (pathname === "/admin" || pathname === "/api/admin") {
    return [
      "ACCESS_REQUEST_MANAGE",
      "MEMBER_MANAGE",
      "PIECE_MANAGE",
      "INVOICE_READ",
    ];
  }
  // Unknown /admin/* paths: deny (no ACCESS_REQUEST_MANAGE fallback)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return "deny";
  }
  return null;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isMemberRoute = matchPrefix(pathname, memberPrefixes);
  const isAdminRoute = matchPrefix(pathname, adminPrefixes);

  if (!isMemberRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!req.auth?.user?.id) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { detail: "Unauthorized", code: "http_401" },
        { status: 401 },
      );
    }
    const signInUrl = new URL("/auth/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const role = req.auth.user.role;

  if (isAdminRoute) {
    if (!hasAdminAreaAccess(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { detail: "Forbidden", code: "http_403" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    const needed = permissionForAdminPath(pathname);
    if (needed === "deny") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { detail: "Forbidden", code: "http_403" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    if (needed) {
      const allowed = Array.isArray(needed)
        ? needed.some((p) => hasPermission(role, p))
        : hasPermission(role, needed);
      if (!allowed) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { detail: "Forbidden", code: "http_403" },
            { status: 403 },
          );
        }
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
