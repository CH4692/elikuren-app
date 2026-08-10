"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/components/navbar/navbar";
import NavbarMobile from "@/components/navbar/mobile-menu";
import {
  SiteFooter,
  type SiteFooterProps,
} from "@/components/site/site-footer";
import type { PublicNavItem } from "@/lib/site-content/public-chrome";

export function PublicShellClient({
  children,
  navItems,
  footer,
}: {
  children: ReactNode;
  navItems: PublicNavItem[];
  footer: SiteFooterProps | null;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar items={navItems} />
      <NavbarMobile items={navItems} />
      {children}
      {footer ? <SiteFooter {...footer} /> : null}
    </>
  );
}
