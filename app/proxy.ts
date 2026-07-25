import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminRole } from "@/lib/authz";

const protectedPrefixes = ["/dashboard", "/admin", "/profile", "/api/me"];
const adminPrefixes = ["/admin", "/api/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAdminRoute = adminPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!req.auth) {
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

  if (isAdminRoute && !isAdminRole(req.auth.user?.role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { detail: "Forbidden", code: "http_403" },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/profile", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
