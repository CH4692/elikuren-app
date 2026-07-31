"use client";

import {
  FileMusic,
  Headphones,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Shield,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  firstname?: string | null;
  lastname?: string | null;
};

type UserMenuProps = {
  user: UserMenuUser;
  showAdmin?: boolean;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  className?: string;
};

function initialsFor(user: UserMenuUser) {
  const first = user.firstname?.trim()?.[0];
  const last = user.lastname?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  const fromName = user.name
    ?.split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  if (fromName) return fromName.toUpperCase();
  return (user.email?.[0] ?? "?").toUpperCase();
}

function displayName(user: UserMenuUser) {
  const full = [user.firstname, user.lastname].filter(Boolean).join(" ").trim();
  return full || user.name || user.email || "Konto";
}

const memberLinks = [
  { href: "/dashboard", label: "Mitglieder-Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Mein Profil", icon: UserRound },
  { href: "/library/scores", label: "Noten & Stücke", icon: FileMusic },
  { href: "/library/audio", label: "Audio & Üben", icon: Headphones },
  { href: "/announcements", label: "Mitteilungen", icon: Megaphone },
] as const;

export function UserMenu({
  user,
  showAdmin = false,
  variant = "desktop",
  onNavigate,
  className,
}: UserMenuProps) {
  const router = useRouter();
  const initials = initialsFor(user);
  const name = displayName(user);

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <Avatar className="size-10">
            <AvatarFallback className="bg-[#C8A24D] text-[#1f1f23]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            {user.email ? (
              <p className="truncate text-xs text-foreground/60">{user.email}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {memberLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onNavigate={onNavigate}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-primary/15"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </Link>
          ))}
          {showAdmin ? (
            <Link
              href="/admin"
              onNavigate={onNavigate}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-primary/15"
            >
              <Shield className="size-4 text-primary" />
              Admin-Dashboard
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              void signOut({ callbackUrl: "/" });
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut className="size-4" />
            Abmelden
          </button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full border border-primary/40 bg-white/10 outline-none transition hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/50",
          className,
        )}
        aria-label="Benutzermenü"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-[#C8A24D] text-xs font-semibold text-[#1f1f23]">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-[#F4F1EB]">
              {name}
            </span>
            {user.email ? (
              <span className="truncate text-xs text-[#F4F1EB]/55">
                {user.email}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberLinks.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem
            key={href}
            onClick={() => router.push(href)}
          >
            <Icon className="size-4" />
            {label}
          </DropdownMenuItem>
        ))}
        {showAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <Shield className="size-4" />
              Admin-Dashboard
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
