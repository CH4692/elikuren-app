"use client";
import { Inter } from "next/font/google";
import Logo from "../logo";

import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import Link from "next/link";
import { useState } from "react";
import MenuToggle from "./menu-toggle";
import ClosMenu from "./menu-close";
import { flags } from "@/lib/flags";

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
      <Logo setOpen={setOpen} />
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            aria-label="Menü öffnen"
            onClick={() => setOpen(true)}
          >
            <MenuToggle open={open} />
          </button>

          <SheetContent
            side="top"
            className="bg-background border-background h-full text-foreground"
          >
            <ClosMenu open={open} setOpen={setOpen} />

            <nav className="lg:mt-8 flex flex-col gap-4 px-2 py-4">
              {!flags.aboutDisbled && (
                <Link
                  href="/about"
                  onNavigate={handleClose}
                  className={linksClass}
                >
                  Über den Verein
                </Link>
              )}

              <Link
                href="/home#chorleitung"
                onClick={handleClose}
                className={linksClass}
              >
                Chorleitung
              </Link>

              {!flags.historyDisbled && (
                <Link
                  href="/history"
                  onClick={handleClose}
                  className={linksClass}
                >
                  Geschichte
                </Link>
              )}

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
                Mitsingen
              </Link>

              <Link
                href="/home#support"
                onNavigate={handleClose}
                className={linksClass}
              >
                Unterstützen
              </Link>
              {flags.authDisbled ? (
                ""
              ) : (
                <Link
                  href="/auth/sign-in"
                  onNavigate={handleClose}
                  className={
                    "text-lg hover:text-primary flex items-center border border-second-background p-3 rounded-lg shadow-md lg:hidden"
                  }
                >
                  Mitglieder Login
                </Link>
              )}
              {flags.authDisbled ? (
                ""
              ) : (
                <Link
                  href="/auth/sign-up"
                  onNavigate={handleClose}
                  className={
                    "text-lg hover:text-foreground text-background flex items-center bg-primary p-3 rounded-lg shadow-md lg:hidden "
                  }
                >
                  Mitglieder werden
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
