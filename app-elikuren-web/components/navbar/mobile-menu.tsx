"use client";
import { Inter } from "next/font/google";
import { Menu, X } from "lucide-react";
import Logo from "../logo";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import MenuToggle from "./menu-toggle";
import ClosMenu from "./menu-close";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobile() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`${inter.variable} flex sticky top-0 z-50 lg:hidden justify-around items-center p-4 bg-background/80 backdrop-blur-md border-b-second-background h-20`}
    >
      <Logo setOpen={setOpen} />
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button type="button" aria-label="Menü öffnen">
              <MenuToggle open={open} />
            </button>
          </SheetTrigger>

          <SheetContent
            side="top"
            className="bg-background h-full text-foreground"
          >
            <ClosMenu open={open} setOpen={setOpen} />

            <nav className="mt-8 flex text-center flex-col gap-4">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="text-lg hover:text-primary"
              >
                Über den Verein
              </Link>
              <Link
                href="/home#chorleitung"
                onClick={() => setOpen(false)}
                className="text-lg hover:text-primary"
              >
                Chorleitung
              </Link>
              <Link
                href="/history"
                onClick={() => setOpen(false)}
                className="text-lg hover:text-primary"
              >
                Geschichte
              </Link>
              <Link
                href="/home#concerts"
                onClick={() => setOpen(false)}
                className="text-lg hover:text-primary"
              >
                Konzerte
              </Link>
              <Link
                href="/home#joinus"
                onClick={() => setOpen(false)}
                className="text-lg hover:text-primary"
              >
                Mitsingen
              </Link>
              <Link
                href="/home#support"
                onClick={() => setOpen(false)}
                className="text-lg hover:text-primary"
              >
                Unterstützen
              </Link>

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="outline" asChild>
                  <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                    Mitglieder Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                    Mitglieder werden
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
