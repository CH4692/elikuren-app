import { Inter } from "next/font/google";
import NavbarMobileContent from "./nav-mobile-content";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobile() {
  return (
    <header
      className={`${inter.variable} flex fixed top-0 left-0 w-full z-50 lg:hidden justify-around items-center p-2 backdrop-blur-md border-b-second-background`}
    >
      <NavbarMobileContent />
    </header>
  );
}
