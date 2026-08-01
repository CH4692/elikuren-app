import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileMusic,
  Headphones,
  Megaphone,
  Shield,
  UserRound,
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardAnnouncement = {
  id: string;
  title: string;
  publishedAt: Date | null;
};

export type DashboardEvent = {
  id: string;
  title: string;
  startsAt: Date;
  location: string | null;
};

export type DashboardPiece = {
  id: string;
  title: string;
  composer: string;
};

export type DashboardSheet = {
  pieceId: string;
  title: string;
  name: string;
};

type MemberDashboardProps = {
  firstname: string | null;
  voice: string | null;
  showAdmin: boolean;
  announcements: DashboardAnnouncement[];
  upcomingEvents: DashboardEvent[];
  rehearsing: DashboardPiece[];
  recentSheets: DashboardSheet[];
};

function formatEventWhen(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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
    href: "/events",
    title: "Termine",
    description: "Proben & Konzerte",
    icon: CalendarDays,
  },
  {
    href: "/announcements",
    title: "Mitteilungen",
    description: "Aktuelle Hinweise",
    icon: Megaphone,
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
  showAdmin,
  announcements,
  upcomingEvents,
  rehearsing,
  recentSheets,
}: MemberDashboardProps) {
  const greetingName = firstname?.trim() || "dort";

  return (
    <div className="space-y-8">
      {/* 1. Status / welcome — answers “who am I / what’s my standing?” */}
      <section className="relative overflow-hidden rounded-3xl border border-[#d9d2c4] bg-[#1f1f23] px-6 py-7 text-[#f4f1eb] shadow-sm sm:px-8 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,162,77,0.28),_transparent_55%)]"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center rounded-full border border-[#C8A24D]/40 bg-[#C8A24D]/15 px-3 py-1 text-xs font-medium tracking-wide text-[#E8D5A3]">
              Aktives Mitglied
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Hallo {greetingName}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[#f4f1eb]/70 sm:text-base">
              {voice
                ? `Stimme: ${voice}. Hier findest du Probenmaterial, Termine und Mitteilungen.`
                : "Willkommen im Mitgliederbereich. Ergänze kurz deine Stimmlage im Profil."}
            </p>
          </div>
          <Button
            asChild
            size="xl"
            className="shrink-0 bg-[#C8A24D] text-[#1f1f23] hover:bg-[#d4b35e]"
          >
            <Link href="/library/scores">
              Zu den Noten
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 2. Action needed */}
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

      {/* 3. What’s happening — important announcements */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Wichtige Mitteilungen
          </h2>
          <Link
            href="/announcements"
            className="text-sm font-medium text-[#8a6d2a] hover:underline"
          >
            Alle anzeigen
          </Link>
        </div>
        {announcements.length > 0 ? (
          <ul className="space-y-2">
            {announcements.map((a) => (
              <li key={a.id}>
                <Link
                  href="/announcements"
                  className="flex items-start gap-3 rounded-2xl border border-amber-600/20 bg-amber-50/80 px-4 py-3.5 transition hover:border-amber-600/40"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800">
                    <Megaphone className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-[#1f1f23]">
                      {a.title}
                    </span>
                    {a.publishedAt ? (
                      <span className="mt-0.5 block text-xs text-[#5c574e]">
                        {new Intl.DateTimeFormat("de-DE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(a.publishedAt)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="Keine wichtigen Mitteilungen"
            description="Sobald der Vorstand etwas Dringendes teilt, erscheint es hier."
            className="py-10"
          />
        )}
      </section>

      {/* 4. Next actions / context — events + rehearsal */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Nächste Termine
            </h2>
            <Link
              href="/events"
              className="text-sm font-medium text-[#8a6d2a] hover:underline"
            >
              Kalender
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-2">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href="/events"
                    className="block rounded-2xl border border-[#d9d2c4] bg-white/70 px-4 py-3.5 transition hover:border-[#C8A24D]/55"
                  >
                    <span className="font-medium text-[#1f1f23]">
                      {event.title}
                    </span>
                    <span className="mt-1 block text-sm text-[#5c574e]">
                      {formatEventWhen(event.startsAt)}
                      {event.location ? ` · ${event.location}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Keine anstehenden Termine"
              description="Proben und Konzerte erscheinen hier, sobald sie eingetragen sind."
              className="py-10"
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Aktuell in Probe
            </h2>
            <Link
              href="/library/scores"
              className="text-sm font-medium text-[#8a6d2a] hover:underline"
            >
              Bibliothek
            </Link>
          </div>
          {rehearsing.length > 0 ? (
            <ul className="space-y-2">
              {rehearsing.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/library/pieces/${p.id}`}
                    className="block rounded-2xl border border-[#C8A24D]/30 bg-white/70 px-4 py-3.5 transition hover:border-[#C8A24D]/60"
                  >
                    <span className="font-medium text-[#1f1f23]">{p.title}</span>
                    <span className="mt-1 block text-sm text-[#5c574e]">
                      {p.composer}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileMusic}
              title="Noch keine Stücke in Probe"
              description="Aktuelle Probenstücke erscheinen hier mit Direktlink zu Noten und Audio."
              className="py-10"
            />
          )}
        </div>
      </section>

      {/* 5. New resources */}
      {recentSheets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Neue Noten</h2>
          <ul className="divide-y divide-[#ebe4d8] overflow-hidden rounded-2xl border border-[#d9d2c4] bg-white/70">
            {recentSheets.map((s) => (
              <li key={`${s.pieceId}-${s.name}`}>
                <Link
                  href={`/library/pieces/${s.pieceId}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-[#C8A24D]/08"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-[#1f1f23]">{s.title}</span>
                    <span className="mt-0.5 block truncate text-[#5c574e]">
                      {s.name}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-[#C8A24D]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 6. Quick access — one primary task cluster */}
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
          {showAdmin ? (
            <Link
              href="/admin"
              className="group flex items-start gap-3 rounded-2xl border border-[#1e3a2f]/25 bg-[#1e3a2f]/5 p-4 transition hover:border-[#1e3a2f]/45 hover:shadow-sm"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1e3a2f]/12 text-[#1e3a2f]">
                <Shield className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-[#1f1f23]">
                  Verwaltung
                </span>
                <span className="mt-0.5 block text-sm text-[#5c574e]">
                  Stücke, Mitglieder und Mitteilungen
                </span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
