"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  hasAdminAreaAccess,
  hasPermission,
} from "@/lib/permissions";

type AuthNavProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AuthNav({ variant = "desktop", onNavigate }: AuthNavProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className={
          variant === "mobile" ? "h-12 w-full animate-pulse rounded-lg bg-muted" : "h-10 w-28 animate-pulse rounded-lg bg-muted"
        }
      />
    );
  }

  if (session?.user?.id) {
    const role = session.user.role;
    const label =
      [session.user.firstname, session.user.lastname].filter(Boolean).join(" ") ||
      "Profil";
    const memberLinks = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/library/scores", label: "Noten" },
      { href: "/library/audio", label: "Audio" },
      { href: "/announcements", label: "Mitteilungen" },
      { href: "/profile", label: "Profil" },
    ];
    const adminLinks = [
      hasPermission(role, "ACCESS_REQUEST_MANAGE")
        ? { href: "/admin/requests", label: "Freigaben" }
        : null,
      hasPermission(role, "PIECE_MANAGE")
        ? { href: "/admin/pieces", label: "Stücke" }
        : null,
      hasAdminAreaAccess(role) ? { href: "/admin", label: "Verwaltung" } : null,
    ].filter(Boolean) as Array<{ href: string; label: string }>;

    if (variant === "mobile") {
      return (
        <div className="flex flex-col gap-3">
          {memberLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onNavigate={onNavigate}
              className="text-lg hover:text-primary flex items-center border border-second-background p-3 rounded-lg shadow-md"
            >
              {link.label}
            </Link>
          ))}
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onNavigate={onNavigate}
              className="text-lg hover:text-primary flex items-center border border-second-background p-3 rounded-lg shadow-md"
            >
              {link.label}
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button size="xl" variant="outline" asChild>
          <Link href="/dashboard">Bereich</Link>
        </Button>
        {hasAdminAreaAccess(role) ? (
          <Button size="xl" variant="outline" asChild>
            <Link href="/admin">Verwaltung</Link>
          </Button>
        ) : null}
        <Button size="xl" asChild>
          <Link href="/profile" className="inline-flex items-center gap-2">
            <UserRound className="size-4" />
            {label}
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href="/auth/sign-in"
          onNavigate={onNavigate}
          className="text-lg hover:text-primary flex items-center border border-second-background p-3 rounded-lg shadow-md"
        >
          Mitglieder Login
        </Link>
        <Link
          href="/auth/sign-up"
          onNavigate={onNavigate}
          className="text-lg hover:text-foreground text-background flex items-center gap-2 bg-primary p-3 rounded-lg shadow-md"
        >
          Mitglied werden
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="xl" variant="outline" asChild>
        <Link href="/auth/sign-in">Login</Link>
      </Button>
      <Button size="xl" asChild>
        <Link href="/auth/sign-up">Mitglied werden</Link>
      </Button>
    </div>
  );
}
