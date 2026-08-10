import { Inter } from "next/font/google";

import NavbarMobileContent from "@/components/navbar/nav-mobile-content";
import type { PublicNavItem } from "@/lib/site-content/public-chrome";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobile({ items }: { items: PublicNavItem[] }) {
  return (
    <header
      className={`${inter.variable} fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-second-background/40 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden`}
    >
      <NavbarMobileContent items={items} />
    </header>
  );
}
