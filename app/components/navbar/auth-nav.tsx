"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { UserMenu } from "@/components/app/user-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { hasAdminAreaAccess } from "@/lib/permissions";

type AuthNavProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

/**
 * Hierarchy (navbar CTA best practice):
 * - One primary: „Mitglied werden“ (solid brand gold)
 * - One secondary: „Login“ (ghost on dark header — never white fill)
 */
export function AuthNav({ variant = "desktop", onNavigate }: AuthNavProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return variant === "mobile" ? (
      <Skeleton className="h-24 w-full rounded-xl" />
    ) : (
      <Skeleton className="size-10 rounded-full" />
    );
  }

  if (session?.user?.id) {
    return (
      <UserMenu
        user={{
          name: session.user.name,
          email: session.user.email,
          firstname: session.user.firstname,
          lastname: session.user.lastname,
        }}
        showAdmin={hasAdminAreaAccess(session.user.role)}
        variant={variant}
        onNavigate={onNavigate}
      />
    );
  }

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href="/auth/sign-in"
          onNavigate={onNavigate}
          className="flex items-center rounded-lg border border-primary/45 bg-transparent p-3 text-lg text-foreground transition-colors hover:border-primary hover:bg-primary/10"
        >
          Mitglieder Login
        </Link>
        <Link
          href="/auth/sign-up"
          onNavigate={onNavigate}
          className="flex items-center gap-2 rounded-lg bg-primary p-3 text-lg text-[#1F1F23] shadow-md transition-colors hover:bg-primary/90"
        >
          Mitglied werden
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="xl"
        variant="ghost"
        asChild
        className="border border-primary/45 bg-transparent text-[#F4F1EB] hover:border-primary hover:bg-primary/12 hover:text-[#F4F1EB]"
      >
        <Link href="/auth/sign-in">Login</Link>
      </Button>
      <Button size="xl" asChild className="text-[#1F1F23]">
        <Link href="/auth/sign-up">Mitglied werden</Link>
      </Button>
    </div>
  );
}
