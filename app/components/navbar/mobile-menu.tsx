import { Inter } from "next/font/google";
import NavbarMobileContent from "./nav-mobile-content";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobile() {
  return (
    <header
      className={`${inter.variable} fixed top-0 left-0 z-50 flex w-full items-center justify-between px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md border-b border-second-background/40 lg:hidden`}
    >
      <NavbarMobileContent />
    </header>
  );
}
