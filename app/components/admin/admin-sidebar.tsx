"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
} from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { hasPermission, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  role: string;
};

function NavList({
  role,
  pathname,
  onNavigate,
}: {
  role: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const items = ADMIN_NAV_ITEMS.filter(
    (item) =>
      item.permission === null ||
      hasPermission(role, item.permission as Permission),
  );

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {items.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onNavigate={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
              active
                ? "bg-[#C8A24D]/20 font-medium text-[#C8A24D]"
                : "text-[#F4F1EB]/80 hover:bg-white/5 hover:text-[#F4F1EB]",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:flex">
        <div className="border-b border-[var(--sidebar-border)] px-5 py-5">
          <Link href="/admin" className="block">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A24D]/80">
              Elikuren
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight">
              Verwaltung
            </p>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <NavList role={role} pathname={pathname} />
        </div>
        <div className="border-t border-[var(--sidebar-border)] px-4 py-4">
          <Link
            href="/dashboard"
            className="text-xs text-[#F4F1EB]/55 transition hover:text-[#C8A24D]"
          >
            ← Mitgliederbereich
          </Link>
        </div>
      </aside>

      <div className="flex items-center gap-3 border-b border-[#ebe4d8] bg-white/80 px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Admin-Menü"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <SheetContent
            side="left"
            className="w-72 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] p-0 text-[var(--sidebar-foreground)]"
          >
            <SheetHeader className="border-b border-[var(--sidebar-border)] px-4 py-4">
              <SheetTitle className="text-[#F4F1EB]">Verwaltung</SheetTitle>
            </SheetHeader>
            <NavList
              role={role}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#C8A24D]">
            Admin
          </p>
          <p className="text-sm font-medium text-[#1f1f23]">Elikuren</p>
        </div>
      </div>
    </>
  );
}
