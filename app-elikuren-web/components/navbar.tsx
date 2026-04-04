import { Inter } from "next/font/google";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Logo from "./logo";
import Link from "next/link";
import { Button } from "./ui/button";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function Navbar() {
  const MenuLinkClass = `${inter.variable}`;
  return (
    <header
      className={`${inter.variable} flex justify-around items-center p-4 bg-background h-20`}
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
                  <Link href="/home/about">Über den Chor</Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/home/conductor">Dirigent</Link>
                </li>
                <li className="hover:text-primary hover:cursor-pointer">
                  <Link href="/home/history">Geschichte</Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Normale Links */}
          <NavigationMenuItem>
            <Link href="/concerts" className={navigationMenuTriggerStyle()}>
              Konzerte
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/joinus" className={navigationMenuTriggerStyle()}>
              Mitsingen
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/support" className={navigationMenuTriggerStyle()}>
              Unterstützen
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-3">
        <Button size="xl" variant="outline" asChild>
          <Link href="/sign-in">Mitglieder Login</Link>
        </Button>
        <Button size="xl" asChild>
          <Link href="/sign-up">Mitglieder werden</Link>
        </Button>
      </div>
    </header>
  );
}
