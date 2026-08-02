"use client";
import { Inter } from "next/font/google";
import Logo from "../logo";

import { Sheet, SheetContent } from "../ui/sheet";
import Link from "next/link";
import { useState } from "react";
import MenuToggle from "./menu-toggle";
import ClosMenu from "./menu-close";
import { AuthNav } from "./auth-nav";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function NavbarMobileContent({}) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setTimeout(() => setOpen(false), 150);
  const linksClass =
    "text-lg hover:text-primary flex items-center bg-second-background/5 p-3 rounded-lg shadow-md";

  return (
    <>
      <Logo setOpen={setOpen} compact />
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            aria-label="Menü öffnen"
            onClick={() => setOpen(true)}
            className="-mr-1"
          >
            <MenuToggle open={open} />
          </button>

          <SheetContent
            side="top"
            className="inset-x-0 top-0 h-dvh max-h-dvh gap-0 border-background bg-background p-0 text-foreground data-[side=top]:h-dvh"
          >
            <ClosMenu open={open} setOpen={setOpen} />

            <nav className="flex flex-col gap-2 overflow-y-auto px-3 pb-8 pt-1">
              <Link href="/about" onNavigate={handleClose} className={linksClass}>
                Über den Verein
              </Link>
              <Link
                href="/chorleitung"
                onNavigate={handleClose}
                className={linksClass}
              >
                Chorleitung
              </Link>
              <Link
                href="/history"
                onNavigate={handleClose}
                className={linksClass}
              >
                Geschichte
              </Link>
              <Link
                href="/proben"
                onNavigate={handleClose}
                className={linksClass}
              >
                Proben & Mitsingen
              </Link>
              <Link
                href="/home#concerts"
                onNavigate={handleClose}
                className={linksClass}
              >
                Konzerte
              </Link>
              <Link
                href="/home#joinus"
                onNavigate={handleClose}
                className={linksClass}
              >
                Ensembles
              </Link>
              <Link
                href="/contact"
                onNavigate={handleClose}
                className={linksClass}
              >
                Kontakt
              </Link>
              <AuthNav variant="mobile" onNavigate={handleClose} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
