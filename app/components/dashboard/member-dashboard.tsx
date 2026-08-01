import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileMusic,
  Headphones,
  MapPin,
  Shield,
  UserRound,
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardEvent = {
  id: string;
  title: string;
  startsAt: Date;
  location: string | null;
};

export type DashboardProject = {
  id: string;
  title: string;
  composer: string;
  sheetCount: number;
  audioCount: number;
};

export type DashboardLibraryItem = {
  pieceId: string;
  pieceTitle: string;
  name: string;
  kind: "score" | "audio";
};

type MemberDashboardProps = {
  firstname: string | null;
  voice: string | null;
  showAdmin: boolean;
  nextEvent: DashboardEvent | null;
  currentProject: DashboardProject | null;
  recentLibrary: DashboardLibraryItem[];
};

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatEventTime(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
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
  nextEvent,
  currentProject,
  recentLibrary,
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
              Schön, dass du da bist. Alle wichtigen Unterlagen für das aktuelle
              Chorprojekt findest du hier.
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
                  Stücke, Mitglieder und Inhalte
                </span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Nächster Termin
            </h2>
            <Link
              href="/events"
              className="text-sm font-medium text-[#8a6d2a] hover:underline"
            >
              Zum Kalender
            </Link>
          </div>
          {nextEvent ? (
            <Link
              href="/events"
              className="block rounded-3xl border border-[#C8A24D]/35 bg-white/80 p-5 shadow-sm transition hover:border-[#C8A24D]/60 hover:shadow-md"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#8a6d2a]">
                <CalendarDays className="size-3.5" />
                {formatEventDate(nextEvent.startsAt)}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#1f1f23]">
                {nextEvent.title}
              </h3>
              <p className="mt-2 text-sm text-[#5c574e]">
                {formatEventTime(nextEvent.startsAt)} Uhr
              </p>
              {nextEvent.location ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5c574e]">
                  <MapPin className="size-3.5 shrink-0" />
                  {nextEvent.location}
                </p>
              ) : null}
              <span className="mt-4 inline-flex items-center text-sm font-medium text-[#8a6d2a]">
                Im Kalender öffnen
                <ArrowRight className="ml-1 size-4" />
              </span>
            </Link>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Kein anstehender Termin"
              description="Der nächste Probe- oder Konzerttermin erscheint hier."
              className="py-10"
            />
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Aktuelles Projekt
          </h2>
          {currentProject ? (
            <div className="rounded-3xl border border-[#C8A24D]/35 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-[#8a6d2a]">
                {currentProject.composer}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#1f1f23]">
                {currentProject.title}
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#C8A24D]/10 px-3 py-2.5">
                  <dt className="text-xs text-[#5c574e]">Noten</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-[#1f1f23]">
                    {currentProject.sheetCount}
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#C8A24D]/10 px-3 py-2.5">
                  <dt className="text-xs text-[#5c574e]">Audios</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-[#1f1f23]">
                    {currentProject.audioCount}
                  </dd>
                </div>
              </dl>
              <Button
                asChild
                className="mt-5 w-full bg-[#C8A24D] text-[#1f1f23] hover:bg-[#d4b35e] sm:w-auto"
              >
                <Link href={`/library/pieces/${currentProject.id}`}>
                  Zur Bibliothek
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={FileMusic}
              title="Kein aktuelles Projekt"
              description="Sobald ein Stück in Probe ist, erscheint es hier mit Noten und Audio."
              className="py-10"
            />
          )}
        </div>
      </section>

      {recentLibrary.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Neu in der Bibliothek
          </h2>
          <ul className="divide-y divide-[#ebe4d8] overflow-hidden rounded-2xl border border-[#d9d2c4] bg-white/70">
            {recentLibrary.map((item) => (
              <li key={`${item.kind}-${item.pieceId}-${item.name}`}>
                <Link
                  href={`/library/pieces/${item.pieceId}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-[#C8A24D]/08"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-[#1f1f23]">
                      {item.pieceTitle}
                    </span>
                    <span className="mt-0.5 block truncate text-[#5c574e]">
                      {item.kind === "score" ? "Note" : "Audio"} · {item.name}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-[#C8A24D]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
