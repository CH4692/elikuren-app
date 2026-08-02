import { unstable_cache } from "next/cache";

import { formatBerlinDateTimeLocal } from "@/lib/datetime-berlin";
import { prisma } from "@/lib/db";
import { isConcertPubliclyVisible } from "@/lib/concert-visibility";
import { publicObjectUrl, resolveMediaAlt } from "@/lib/public-media";

export {
  concertVisibleUntil,
  isConcertPubliclyVisible,
} from "@/lib/concert-visibility";

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
  extraInfo: string | null;
  ticketUrl: string | null;
  hero: {
    url: string | null;
    alt: string;
  } | null;
};

const loadPublicConcertCandidates = unstable_cache(
  async () => {
    return prisma.concert.findMany({
      where: {
        showOnWebsite: true,
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
  },
  ["concerts-public-candidates"],
  { tags: [CONCERTS_PUBLIC_CACHE_TAG] },
);

/**
 * Public concerts:
 * showOnWebsite && startsAt != null && now <= coalesce(endsAt, endOfDayBerlin(startsAt))
 *
 * Candidates are cache-tagged; the time window is evaluated per request.
 */
export async function listPublicConcerts(
  now = new Date(),
): Promise<PublicConcertCard[]> {
  const rows = await loadPublicConcertCandidates();

  return rows
    .filter((row) =>
      isConcertPubliclyVisible(
        {
          showOnWebsite: row.showOnWebsite,
          startsAt: row.startsAt,
          endsAt: row.endsAt,
        },
        now,
      ),
    )
    .map((row) => {
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
        startsAt: row.startsAt!,
        endsAt: row.endsAt,
        location: row.location,
        address: row.address,
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
