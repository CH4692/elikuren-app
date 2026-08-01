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
