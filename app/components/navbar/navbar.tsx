import { Inter } from "next/font/google";
import Link from "next/link";

import { AuthNav } from "@/components/navbar/auth-nav";
import Logo from "@/components/logo";
import { SiteLink } from "@/components/site/site-link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import type { PublicNavItem } from "@/lib/site-content/public-chrome";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function Navbar({ items }: { items: PublicNavItem[] }) {
  return (
    <header
      className={`${inter.variable} fixed top-0 left-0 z-50 hidden w-full items-center justify-around border-b-second-background bg-background/80 p-2 backdrop-blur-md lg:flex`}
    >
      <Logo />
      <NavigationMenu>
        <NavigationMenuList>
          {items.map((item) => {
            const children = item.children ?? [];
            if (children.length > 0) {
              return (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[220px] gap-2 bg-background p-4">
                      {children.map((child) => (
                        <li
                          key={child.id}
                          className="transition-all hover:cursor-pointer hover:text-primary"
                        >
                          <SiteLink href={child.href} className="block w-full">
                            {child.label}
                          </SiteLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            }

            if (!item.href) return null;

            return (
              <NavigationMenuItem key={item.id}>
                {item.href.startsWith("https://") ? (
                  <SiteLink
                    href={item.href}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </SiteLink>
                ) : (
                  <Link
                    href={item.href}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </Link>
                )}
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <AuthNav variant="desktop" />
    </header>
  );
}
