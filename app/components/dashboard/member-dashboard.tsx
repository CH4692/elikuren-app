import Link from "next/link";
import { FileMusic, Headphones, UserRound } from "lucide-react";

import {
  ActiveConcertCard,
  type ActiveConcertSummary,
} from "@/components/app/active-concert-card";
import { MemberPageIntro } from "@/components/app/member-page-intro";
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
    description: "Noten durchsuchen",
    icon: FileMusic,
  },
  {
    href: "/library/audio",
    title: "Audio",
    description: "Übedateien und Mitschnitte",
    icon: Headphones,
  },
  {
    href: "/profile",
    title: "Profil",
    description: "Profil bearbeiten",
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
      <MemberPageIntro
        title={`Hallo ${greetingName}`}
        description="Aktuelles Konzertprogramm, Notenkatalog und Übedateien findest du in der Bibliothek."
      />

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
