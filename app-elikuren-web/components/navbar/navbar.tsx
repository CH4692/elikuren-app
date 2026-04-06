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
import { Button } from "../ui/button";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function Navbar() {
  const MenuLinkClass = `${inter.variable}`;
  return (
    <header
      className={`${inter.variable} sticky hidden lg:flex top-0 z-50 justify-around items-center p-4 bg-background/80 backdrop-blur-md border-b-second-background h-20`}
    >
      <Logo />
      <NavigationMenu>
        <NavigationMenuList>
          {/* Über Uns (Dropdown) */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Über Uns</NavigationMenuTrigger>

            <NavigationMenuContent>
              <ul className="grid w-[220px] gap-2 p-4 bg-background">
                <li className="hover:text-primary hover:cursor-pointer transition-all">
                  <Link href="/about">Über den Verein</Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/home#chorleitung">Chorleitung</Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/history">Geschichte</Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Normale Links */}
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
              Mitsingen
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/home#support" className={navigationMenuTriggerStyle()}>
              Unterstützen
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-3">
        <Button size="xl" variant="outline" asChild>
          <Link href="/auth/sign-in">Mitglieder Login</Link>
        </Button>
        <Button size="xl" asChild>
          <Link href="/auth/sign-up">Mitglieder werden</Link>
        </Button>
      </div>
    </header>
  );
}
