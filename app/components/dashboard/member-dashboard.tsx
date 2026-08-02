import Link from "next/link";
import {
  ArrowRight,
  FileMusic,
  Headphones,
  UserRound,
} from "lucide-react";

import {
  ActiveConcertCard,
  type ActiveConcertSummary,
} from "@/components/app/active-concert-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MemberDashboardProps = {
  firstname: string | null;
  voice: string | null;
  activeConcert: ActiveConcertSummary | null;
};

const quickLinks = [
  {
    href: "/library/scores",
    title: "Noten",
    description: "Partituren & Stimmen",
    icon: FileMusic,
  },
  {
    href: "/library/audio",
    title: "Audio",
    description: "Übematerial",
    icon: Headphones,
  },
  {
    href: "/profile",
    title: "Profil",
    description: "Meine Daten",
    icon: UserRound,
  },
] as const;

export function MemberDashboard({
  firstname,
  voice,
  activeConcert,
}: MemberDashboardProps) {
  const greetingName = firstname?.trim() || "dort";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-[#d9d2c4] bg-[#1f1f23] px-6 py-7 text-[#f4f1eb] shadow-sm sm:px-8 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,162,77,0.28),_transparent_55%)]"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center rounded-full border border-[#C8A24D]/40 bg-[#C8A24D]/15 px-3 py-1 text-xs font-medium tracking-wide text-[#E8D5A3]">
              Aktives Mitglied
              {voice ? ` · ${voice}` : ""}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Hallo {greetingName}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[#f4f1eb]/70 sm:text-base">
              Schön, dass du da bist. Aktuelles Konzertprogramm, Notenkatalog
              und Übematerial findest du in der Bibliothek.
            </p>
          </div>
          <Button
            asChild
            size="xl"
            className="shrink-0 bg-[#C8A24D] text-[#1f1f23] hover:bg-[#d4b35e]"
          >
            <Link href="/library/scores">
              Zur Bibliothek
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <ActiveConcertCard concert={activeConcert} />

      {!voice ? (
        <section className="rounded-2xl border border-amber-600/25 bg-amber-50 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="font-medium text-[#1f1f23]">Profil vervollständigen</p>
            <p className="mt-0.5 text-sm text-[#5c574e]">
              Mit Stimmlage siehst du passendes Noten- und Übematerial.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-3 sm:mt-0">
            <Link href="/profile">Zum Profil</Link>
          </Button>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Schnellzugriff</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-start gap-3 rounded-2xl border border-[#d9d2c4] bg-white/80 p-4 transition",
                  "hover:border-[#C8A24D]/55 hover:shadow-sm",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#C8A24D]/12 text-[#8a6d2a] transition group-hover:bg-[#C8A24D]/20">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-[#1f1f23]">
                    {link.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#5c574e]">
                    {link.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
