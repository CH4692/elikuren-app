"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/navbar/navbar";
import NavbarMobile from "@/components/navbar/mobile-menu";

export function SiteChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Navbar />
      <NavbarMobile />
    </>
  );
}
