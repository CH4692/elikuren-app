import type { ConcertWebsiteStatus } from "@/lib/generated/prisma/client";

export type ConcertWebsiteBadgeKind =
  | "draft"
  | "published"
  | "published_past"
  | "published_incomplete";

/**
 * Pure visibility decision for a public concert.
 * Callers prepare `visibleUntil` (via concertVisibleUntil) and pass `now` explicitly.
 * No Date construction or timezone logic inside.
 */
export function isConcertVisible(input: {
  websiteStatus: ConcertWebsiteStatus | "DRAFT" | "PUBLISHED";
  startsAt: Date | null;
  visibleUntil: Date | null;
  now: Date;
}): boolean {
  if (input.websiteStatus !== "PUBLISHED") return false;
  if (input.startsAt == null || input.visibleUntil == null) return false;
  return input.now.getTime() <= input.visibleUntil.getTime();
}

/**
 * Admin badge labels. Uses isConcertVisible for the live/past branch;
 * does not invent its own time comparisons beyond presence of prepared values.
 */
export function getConcertWebsiteBadge(input: {
  websiteStatus: ConcertWebsiteStatus | "DRAFT" | "PUBLISHED";
  startsAt: Date | null;
  visibleUntil: Date | null;
  now: Date;
}): { kind: ConcertWebsiteBadgeKind; label: string } {
  if (input.websiteStatus === "DRAFT") {
    return { kind: "draft", label: "Entwurf" };
  }

  if (input.startsAt == null || input.visibleUntil == null) {
    return {
      kind: "published_incomplete",
      label: "Veröffentlicht – unvollständig",
    };
  }

  if (
    isConcertVisible({
      websiteStatus: input.websiteStatus,
      startsAt: input.startsAt,
      visibleUntil: input.visibleUntil,
      now: input.now,
    })
  ) {
    return { kind: "published", label: "Veröffentlicht" };
  }

  return {
    kind: "published_past",
    label: "Veröffentlicht – bereits vorbei",
  };
}
