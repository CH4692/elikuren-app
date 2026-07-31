import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Megaphone,
  Music2,
  Users,
  UserPlus,
} from "lucide-react";

import type { Permission } from "@/lib/permissions";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** null = any admin-area access */
  permission: Permission | null;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Übersicht",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    href: "/admin/members",
    label: "Mitglieder",
    icon: Users,
    permission: "MEMBER_MANAGE",
  },
  {
    href: "/admin/requests",
    label: "Zugangsanfragen",
    icon: UserPlus,
    permission: "ACCESS_REQUEST_MANAGE",
  },
  {
    href: "/admin/pieces",
    label: "Stücke",
    icon: Music2,
    permission: "PIECE_MANAGE",
  },
  {
    href: "/admin/announcements",
    label: "Mitteilungen",
    icon: Megaphone,
    permission: "ANNOUNCEMENT_MANAGE",
  },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
