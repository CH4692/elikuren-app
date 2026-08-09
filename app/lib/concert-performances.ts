import { isConcertVisible } from "@/lib/concert-visibility";
import {
  berlinCalendarDateUtc,
  concertVisibleUntil,
} from "@/lib/datetime-berlin";
import type { ConcertWebsiteStatus } from "@/lib/generated/prisma/client";

export type PerformanceLike = {
  id?: string;
  startsAt: Date;
  endsAt?: Date | null;
  location?: string | null;
  address?: string | null;
  label?: string | null;
  sortOrder?: number;
};

/** Sort by startsAt ascending, then sortOrder. */
export function sortPerformances<T extends PerformanceLike>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const delta = a.startsAt.getTime() - b.startsAt.getTime();
    if (delta !== 0) return delta;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

/**
 * Next upcoming (still visible) performance, else the last one.
 * Used to mirror Concert.startsAt/location for legacy consumers.
 */
export function pickMirrorPerformance<T extends PerformanceLike>(
  performances: T[],
  now = new Date(),
): T | null {
  const sorted = sortPerformances(performances);
  if (sorted.length === 0) return null;

  const upcoming = sorted.find((p) => {
    const visibleUntil = concertVisibleUntil(p.startsAt, p.endsAt ?? null);
    return now.getTime() <= visibleUntil.getTime();
  });
  return upcoming ?? sorted[sorted.length - 1]!;
}

/** Concert is publicly visible if any performance is still within its window. */
export function isConcertVisibleViaPerformances(input: {
  websiteStatus: ConcertWebsiteStatus | "DRAFT" | "PUBLISHED";
  performances: PerformanceLike[];
  now: Date;
}): boolean {
  if (input.websiteStatus !== "PUBLISHED") return false;
  return input.performances.some((p) => {
    const visibleUntil = concertVisibleUntil(p.startsAt, p.endsAt ?? null);
    return isConcertVisible({
      websiteStatus: input.websiteStatus,
      startsAt: p.startsAt,
      visibleUntil,
      now: input.now,
    });
  });
}

/** Upcoming performances only (still visible), sorted. */
export function upcomingPerformances<T extends PerformanceLike>(
  performances: T[],
  now = new Date(),
): T[] {
  return sortPerformances(performances).filter((p) => {
    const visibleUntil = concertVisibleUntil(p.startsAt, p.endsAt ?? null);
    return now.getTime() <= visibleUntil.getTime();
  });
}

export function mirrorFieldsFromPerformance(
  performance: PerformanceLike | null,
): {
  startsAt: Date | null;
  endsAt: Date | null;
  location: string | null;
  address: string | null;
  date: Date | null;
} {
  if (!performance) {
    return {
      startsAt: null,
      endsAt: null,
      location: null,
      address: null,
      date: null,
    };
  }
  const startsAt = performance.startsAt;
  return {
    startsAt,
    endsAt: performance.endsAt ?? null,
    location: performance.location?.trim() || null,
    address: performance.address?.trim() || null,
    date: berlinCalendarDateUtc(startsAt),
  };
}
