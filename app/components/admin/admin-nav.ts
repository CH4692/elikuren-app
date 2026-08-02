import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FileAudio,
  FileMusic,
  FileText,
  Globe,
  ImageIcon,
  LayoutDashboard,
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
    href: "/admin/site",
    label: "Website",
    icon: Globe,
    permission: "SITE_MANAGE",
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
    href: "/admin/concerts",
    label: "Konzerte",
    icon: CalendarDays,
    permission: "CONCERT_MANAGE",
  },
  {
    href: "/admin/scores",
    label: "Noten",
    icon: FileMusic,
    permission: "PIECE_MANAGE",
  },
  {
    href: "/admin/audio",
    label: "Audiodateien",
    icon: FileAudio,
    permission: "PIECE_MANAGE",
  },
  {
    href: "/admin/pictures",
    label: "Medien",
    icon: ImageIcon,
    permission: "MEDIA_MANAGE",
  },
  {
    href: "/admin/invoices",
    label: "Rechnungen & Belege",
    icon: FileText,
    permission: "INVOICE_READ",
  },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
