import { unstable_cache } from "next/cache";

import { isConcertVisible } from "@/lib/concert-visibility";
import {
  asDate,
  concertVisibleUntil,
  formatBerlinDateTimeLocal,
} from "@/lib/datetime-berlin";
import { prisma } from "@/lib/db";
import { publicObjectUrl, resolveMediaAlt } from "@/lib/public-media";

export { isConcertVisible } from "@/lib/concert-visibility";
export { asDate, concertVisibleUntil } from "@/lib/datetime-berlin";

export const CONCERTS_PUBLIC_CACHE_TAG = "concerts-public";

export type PublicConcertCard = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
  address: string | null;
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
      startsAt: { not: null },
    },
    orderBy: { startsAt: "asc" },
    include: {
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

/** Obvious prefilter only — visibility decision is isConcertVisible(). */
const loadPublicConcertCandidates = unstable_cache(
  loadPublicConcertCandidatesUncached,
  // Bump key when Production content is edited outside the admin API
  // (direct DB updates do not call revalidateTag).
  ["concerts-public-candidates-v2"],
  { tags: [CONCERTS_PUBLIC_CACHE_TAG] },
);

export async function listPublicConcerts(
  now = new Date(),
): Promise<PublicConcertCard[]> {
  const rows = (await loadPublicConcertCandidates()) as CachedPublicConcert[];

  return rows
    .map((row) => {
      const startsAt = asDate(row.startsAt);
      const endsAt = asDate(row.endsAt);
      return { row, startsAt, endsAt };
    })
    .filter(({ row, startsAt, endsAt }) => {
      if (!startsAt) return false;
      const visibleUntil = concertVisibleUntil(startsAt, endsAt);
      return isConcertVisible({
        websiteStatus: row.websiteStatus,
        startsAt,
        visibleUntil,
        now,
      });
    })
    .map(({ row, startsAt, endsAt }) => {
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
        startsAt: startsAt!,
        endsAt,
        location: row.location,
        address: row.address,
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

export { formatBerlinDateTimeLocal };
