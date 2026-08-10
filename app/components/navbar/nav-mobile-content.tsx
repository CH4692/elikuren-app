"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

import { AuthNav } from "@/components/navbar/auth-nav";
import ClosMenu from "@/components/navbar/menu-close";
import MenuToggle from "@/components/navbar/menu-toggle";
import Logo from "@/components/logo";
import { SiteLink } from "@/components/site/site-link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { PublicNavItem } from "@/lib/site-content/public-chrome";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobileContent({
  items,
}: {
  items: PublicNavItem[];
}) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setTimeout(() => setOpen(false), 150);
  const linksClass =
    "text-lg hover:text-primary flex items-center bg-second-background/5 p-3 rounded-lg shadow-md";

  const flatLinks = items.flatMap((item) => {
    const children = item.children ?? [];
    if (children.length > 0) {
      return children.map((child) => ({
        id: child.id,
        label: child.label,
        href: child.href,
      }));
    }
    if (!item.href) return [];
    return [{ id: item.id, label: item.label, href: item.href }];
  });

  return (
    <>
      <Logo setOpen={setOpen} compact />
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            aria-label="Menü öffnen"
            onClick={() => setOpen(true)}
            className="-mr-1"
          >
            <MenuToggle open={open} />
          </button>

          <SheetContent
            side="top"
            className="inset-x-0 top-0 h-dvh max-h-dvh gap-0 border-background bg-background p-0 text-foreground data-[side=top]:h-dvh"
          >
            <ClosMenu open={open} setOpen={setOpen} />

            <nav className="flex flex-col gap-2 overflow-y-auto px-3 pt-1 pb-8">
              {flatLinks.map((link) =>
                link.href.startsWith("https://") ? (
                  <SiteLink
                    key={link.id}
                    href={link.href}
                    className={linksClass}
                    onClick={handleClose}
                  >
                    {link.label}
                  </SiteLink>
                ) : (
                  <Link
                    key={link.id}
                    href={link.href}
                    onNavigate={handleClose}
                    className={linksClass}
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <AuthNav variant="mobile" onNavigate={handleClose} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
