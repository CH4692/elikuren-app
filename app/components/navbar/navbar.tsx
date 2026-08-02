import { Inter } from "next/font/google";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Logo from "../logo";
import Link from "next/link";
import { AuthNav } from "./auth-nav";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function Navbar() {
  return (
    <header
      className={`${inter.variable} fixed left-0 w-full hidden lg:flex top-0 z-50 justify-around items-center p-2 bg-background/80 backdrop-blur-md border-b-second-background`}
    >
      <Logo />
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Über Uns</NavigationMenuTrigger>

            <NavigationMenuContent>
              <ul className="grid w-[220px] gap-2 p-4 bg-background">
                <li className="hover:text-primary hover:cursor-pointer transition-all">
                  <Link href="/about">Über den Verein</Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/chorleitung" className="w-full block">
                    Chorleitung
                  </Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/history">Geschichte</Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/proben">Proben & Mitsingen</Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link
              href="/home#concerts"
              className={navigationMenuTriggerStyle()}
            >
              Konzerte
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/home#joinus" className={navigationMenuTriggerStyle()}>
              Ensembles
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/contact" className={navigationMenuTriggerStyle()}>
              Kontakt
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <AuthNav variant="desktop" />
    </header>
  );
}
