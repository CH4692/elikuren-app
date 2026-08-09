import { unstable_cache } from "next/cache";

import {
  isConcertVisibleViaPerformances,
  upcomingPerformances,
} from "@/lib/concert-performances";
import { isConcertVisible } from "@/lib/concert-visibility";
import { asDate } from "@/lib/datetime-berlin";
import { prisma } from "@/lib/db";
import { publicObjectUrl, resolveMediaAlt } from "@/lib/public-media";

export { isConcertVisible } from "@/lib/concert-visibility";
export { asDate, concertVisibleUntil } from "@/lib/datetime-berlin";

export const CONCERTS_PUBLIC_CACHE_TAG = "concerts-public";

export type PublicConcertPerformance = {
  id: string;
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
  address: string | null;
  label: string | null;
};

export type PublicConcertCard = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  /** Next upcoming performance start (compat / sorting). */
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
  address: string | null;
  performances: PublicConcertPerformance[];
  programInfo: string | null;
  leader: string | null;
  admissionInfo: string | null;
  footer: string | null;
  extraInfo: string | null;
  ticketUrl: string | null;
  hero: {
    url: string | null;
    alt: string;
  } | null;
};

type CachedPublicConcert = Awaited<
  ReturnType<typeof loadPublicConcertCandidatesUncached>
>[number];

async function loadPublicConcertCandidatesUncached() {
  return prisma.concert.findMany({
    where: {
      websiteStatus: "PUBLISHED",
      performances: { some: {} },
    },
    orderBy: { startsAt: "asc" },
    include: {
      performances: {
        orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
      },
      heroImage: {
        include: {
          storedFile: {
            select: {
              objectKey: true,
              visibility: true,
              deletedAt: true,
              uploadStatus: true,
            },
          },
        },
      },
    },
  });
}

/** Obvious prefilter only — visibility decision uses performances. */
const loadPublicConcertCandidates = unstable_cache(
  loadPublicConcertCandidatesUncached,
  ["concerts-public-candidates-v4-performances"],
  { tags: [CONCERTS_PUBLIC_CACHE_TAG] },
);

export async function listPublicConcerts(
  now = new Date(),
): Promise<PublicConcertCard[]> {
  const rows = (await loadPublicConcertCandidates()) as CachedPublicConcert[];

  return rows
    .map((row) => {
      const performances = (row.performances ?? [])
        .map((p) => {
          const startsAt = asDate(p.startsAt);
          if (!startsAt) return null;
          return {
            id: p.id,
            startsAt,
            endsAt: asDate(p.endsAt),
            location: p.location,
            address: p.address,
            label: p.label,
          };
        })
        .filter((p): p is PublicConcertPerformance => p != null);

      return { row, performances };
    })
    .filter(({ row, performances }) =>
      isConcertVisibleViaPerformances({
        websiteStatus: row.websiteStatus,
        performances,
        now,
      }),
    )
    .map(({ row, performances }) => {
      const upcoming = upcomingPerformances(performances, now);
      const primary = upcoming[0]!;
      const hero = row.heroImage;
      const file = hero?.storedFile;
      const usable =
        hero &&
        !hero.isArchived &&
        hero.isActive &&
        file &&
        !file.deletedAt &&
        file.uploadStatus === "READY" &&
        file.visibility === "PUBLIC";

      return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        description: row.description,
        startsAt: primary.startsAt,
        endsAt: primary.endsAt,
        location: primary.location,
        address: primary.address,
        performances: upcoming,
        programInfo: row.programInfo,
        leader: row.leader,
        admissionInfo: row.admissionInfo,
        footer: row.footer,
        extraInfo: row.extraInfo,
        ticketUrl: row.ticketUrl,
        hero: usable
          ? {
              url: publicObjectUrl(file.objectKey),
              alt: resolveMediaAlt({
                isDecorative: hero.isDecorative,
                altText: hero.altText,
                title: hero.title,
              }),
            }
          : null,
      };
    });
}

export function formatPublicConcertDate(startsAt: Date): string {
  return startsAt.toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPublicConcertTime(startsAt: Date): string {
  return startsAt.toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  });
}
