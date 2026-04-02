import { Inter } from "next/font/google";
import { ChevronDown } from "lucide-react";
import MenuLink from "./menu_link";
import Logo from "./logo";
import Link from "next/link";

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
      <ul className="flex text-foreground text-base gap-5">
        <li className="flex gap-1">
          <MenuLink className={MenuLinkClass} href="/home/about">
            Über Uns
            <ChevronDown />
          </MenuLink>
        </li>
        <li>
          <MenuLink className={MenuLinkClass} href="/concerts">
            Konzerte
          </MenuLink>
        </li>
        <li>
          <MenuLink className={MenuLinkClass} href="/joinus">
            Mitsingen
          </MenuLink>
        </li>
        <li>
          <MenuLink className={MenuLinkClass} href="/support">
            Unterstützen
          </MenuLink>
        </li>
      </ul>
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className={`border border-foreground py-2 px-4 text-base rounded-lg ${inter.variable}`}
        >
          Mitglieder Login
        </Link>
        <Link
          href="/sign-up"
          className={`border border-primary py-2 px-4 rounded-lg text-base bg-primary text-background ${inter.variable}`}
        >
          Mitglieder werden
        </Link>
      </div>
    </header>
  );
}
