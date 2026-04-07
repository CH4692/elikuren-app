"use client";
import { Inter } from "next/font/google";
import Logo from "../logo";

import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import MenuToggle from "./menu-toggle";
import ClosMenu from "./menu-close";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobileContent() {
  const [open, setOpen] = useState(false);
  const linksClass =
    "text-lg hover:text-primary flex items-center bg-second-background/5 p-3 rounded-lg shadow-md";

  return (
    <>
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
            className="bg-background border-background h-full text-foreground"
          >
            <ClosMenu open={open} setOpen={setOpen} />

            <nav className="lg:mt-8 flex flex-col gap-4 px-2 py-4">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className={linksClass}
              >
                Über den Verein
              </Link>

              <Link
                href="/home#chorleitung"
                onClick={() => setOpen(false)}
                className={linksClass}
              >
                Chorleitung
              </Link>
              <Link
                href="/history"
                onClick={() => setOpen(false)}
                className={linksClass}
              >
                Geschichte
              </Link>
              <Link
                href="/home#concerts"
                onClick={() => setOpen(false)}
                className={linksClass}
              >
                Konzerte
              </Link>
              <Link
                href="/home#joinus"
                onClick={() => setOpen(false)}
                className={linksClass}
              >
                Mitsingen
              </Link>
              <Link
                href="/home#support"
                onClick={() => setOpen(false)}
                className={linksClass}
              >
                Unterstützen
              </Link>
              <Link
                href="/auth/sign-in"
                onClick={() => setOpen(false)}
                className={
                  "text-lg hover:text-primary flex items-center border border-second-background p-3 rounded-lg shadow-md lg:hidden"
                }
              >
                Mitglieder Login
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setOpen(false)}
                className={
                  "text-lg hover:text-foreground text-background flex items-center bg-primary p-3 rounded-lg shadow-md lg:hidden "
                }
              >
                Mitglieder werden
              </Link>

              <div className="lg:mt-6 flex flex-col gap-3 hidden">
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
    </>
  );
}
