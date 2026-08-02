import { revalidatePath, revalidateTag } from "next/cache";

import { formatConcertLabel } from "@/lib/concert-label";
import {
  getConcertWebsiteBadge,
  isConcertVisible,
} from "@/lib/concert-visibility";
import {
  berlinCalendarDateUtc,
  concertVisibleUntil,
  formatBerlinDateTimeLocal,
  parseBerlinDateTimeLocal,
} from "@/lib/datetime-berlin";
import { prisma } from "@/lib/db";
import type {
  ConcertWebsiteStatus,
  Role,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { hasPermission } from "@/lib/permissions";

const CONCERTS_PUBLIC_CACHE_TAG = "concerts-public";

export { formatConcertLabel } from "@/lib/concert-label";

export type ConcertWriteInput = {
  title?: string;
  slug?: string | null;
  date?: string | null;
  /** Europe/Berlin datetime-local `YYYY-MM-DDTHH:mm` or null to clear */
  startsAt?: string | null;
  endsAt?: string | null;
  subtitle?: string | null;
  description?: string | null;
  location?: string | null;
  address?: string | null;
  programInfo?: string | null;
  leader?: string | null;
  admissionInfo?: string | null;
  footer?: string | null;
  extraInfo?: string | null;
  ticketUrl?: string | null;
  websiteStatus?: ConcertWebsiteStatus | "DRAFT" | "PUBLISHED";
  heroImageId?: string | null;
  isCurrent?: boolean;
  notes?: string | null;
};

function parseOptionalBerlinDateTime(
  value: string | null | undefined,
  field: string,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === "") return null;
  try {
    return parseBerlinDateTimeLocal(value);
  } catch {
    throw new Error(`${field}: ungültige Datum/Uhrzeit`);
  }
}

function parseWebsiteStatus(
  value: ConcertWriteInput["websiteStatus"],
): ConcertWebsiteStatus | undefined {
  if (value === undefined) return undefined;
  if (value === "DRAFT" || value === "PUBLISHED") return value;
  throw new Error("websiteStatus muss DRAFT oder PUBLISHED sein");
}

function assertWebsitePublishRules(input: {
  websiteStatus: ConcertWebsiteStatus;
  startsAt: Date | null;
  endsAt: Date | null;
}) {
  if (input.websiteStatus === "PUBLISHED" && !input.startsAt) {
    throw new Error(
      "Zum Veröffentlichen muss eine Startzeit gesetzt sein.",
    );
  }
  if (input.startsAt && input.endsAt && !(input.endsAt > input.startsAt)) {
    throw new Error("endsAt muss nach startsAt liegen.");
  }
}

function revalidatePublicConcerts() {
  revalidateTag(CONCERTS_PUBLIC_CACHE_TAG, "max");
  revalidatePath("/home");
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueConcertSlug(base: string, excludeId?: string) {
  const slug = slugify(base) || "konzert";
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.concert.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
  }
}

const itemInclude = {
  sheetFile: {
    select: {
      id: true,
      title: true,
      composer: true,
      voiceGroup: true,
      accessScope: true,
      isVisible: true,
      storedFileId: true,
      storedFile: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          uploadStatus: true,
          deletedAt: true,
        },
      },
    },
  },
  audioFile: {
    select: {
      id: true,
      title: true,
      audioType: true,
      voiceGroup: true,
      accessScope: true,
      isVisible: true,
      storedFileId: true,
      storedFile: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          uploadStatus: true,
          deletedAt: true,
        },
      },
    },
  },
} as const;

export function serializeConcertItem(item: {
  id: string;
  sortOrder: number;
  title: string;
  ensemble: VoiceGroup | null;
  sheetFileId: string | null;
  audioFileId: string | null;
  sheetFile: {
    id: string;
    title: string;
    composer: string;
    voiceGroup: VoiceGroup | null;
    storedFileId: string;
    storedFile: { id: string; originalName: string; mimeType: string };
  } | null;
  audioFile: {
    id: string;
    title: string;
    audioType: string;
    voiceGroup: VoiceGroup | null;
    storedFileId: string;
    storedFile: { id: string; originalName: string; mimeType: string };
  } | null;
}) {
  return {
    id: item.id,
    sort_order: item.sortOrder,
    title: item.title,
    ensemble: item.ensemble,
    sheet_file_id: item.sheetFileId,
    audio_file_id: item.audioFileId,
    sheet_file: item.sheetFile
      ? {
          id: item.sheetFile.id,
          title: item.sheetFile.title,
          composer: item.sheetFile.composer,
          voice_group: item.sheetFile.voiceGroup,
          stored_file_id: item.sheetFile.storedFileId,
          original_name: item.sheetFile.storedFile.originalName,
          mime_type: item.sheetFile.storedFile.mimeType,
        }
      : null,
    audio_file: item.audioFile
      ? {
          id: item.audioFile.id,
          title: item.audioFile.title,
          audio_type: item.audioFile.audioType,
          voice_group: item.audioFile.voiceGroup,
          stored_file_id: item.audioFile.storedFileId,
          original_name: item.audioFile.storedFile.originalName,
          mime_type: item.audioFile.storedFile.mimeType,
        }
      : null,
  };
}

export function serializeConcert(
  concert: {
    id: string;
    title: string;
    slug: string;
    date: Date | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    subtitle?: string | null;
    description?: string | null;
    location?: string | null;
    address?: string | null;
    programInfo?: string | null;
    leader?: string | null;
    admissionInfo?: string | null;
    footer?: string | null;
    extraInfo?: string | null;
    ticketUrl?: string | null;
    websiteStatus?: ConcertWebsiteStatus;
    heroImageId?: string | null;
    isCurrent: boolean;
    notes: string | null;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
    items?: Parameters<typeof serializeConcertItem>[0][];
    _count?: { items: number; recordings: number };
  },
  now = new Date(),
) {
  const date = concert.date ? concert.date.toISOString().slice(0, 10) : null;
  const year = date ? Number(date.slice(0, 4)) : null;
  const websiteStatus = concert.websiteStatus ?? "DRAFT";
  const startsAt = concert.startsAt ?? null;
  const endsAt = concert.endsAt ?? null;
  const visibleUntil =
    startsAt != null ? concertVisibleUntil(startsAt, endsAt) : null;
  const badge = getConcertWebsiteBadge({
    websiteStatus,
    startsAt,
    visibleUntil,
    now,
  });
  return {
    id: concert.id,
    title: concert.title,
    label: formatConcertLabel({ title: concert.title, year, date }),
    slug: concert.slug,
    date,
    year,
    starts_at: startsAt ? formatBerlinDateTimeLocal(startsAt) : null,
    ends_at: endsAt ? formatBerlinDateTimeLocal(endsAt) : null,
    subtitle: concert.subtitle ?? null,
    description: concert.description ?? null,
    location: concert.location ?? null,
    address: concert.address ?? null,
    program_info: concert.programInfo ?? null,
    leader: concert.leader ?? null,
    admission_info: concert.admissionInfo ?? null,
    footer: concert.footer ?? null,
    extra_info: concert.extraInfo ?? null,
    ticket_url: concert.ticketUrl ?? null,
    website_status: websiteStatus,
    website_badge: badge.kind,
    website_badge_label: badge.label,
    is_publicly_visible: isConcertVisible({
      websiteStatus,
      startsAt,
      visibleUntil,
      now,
    }),
    hero_image_id: concert.heroImageId ?? null,
    needs_starts_at: startsAt == null,
    is_current: concert.isCurrent,
    notes: concert.notes,
    is_visible: concert.isVisible,
    item_count: concert._count?.items ?? concert.items?.length ?? 0,
    recording_count: concert._count?.recordings ?? 0,
    items: concert.items?.map(serializeConcertItem),
    created_at: concert.createdAt.toISOString(),
    updated_at: concert.updatedAt.toISOString(),
  };
}

export async function listConcertsAdmin(q?: string) {
  const rows = await prisma.concert.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { notes: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { items: true, recordings: true } },
    },
  });

  // Year desc, then concert date desc (null dates last), then title.
  return rows.sort((a, b) => {
    const yearA = a.date ? a.date.getUTCFullYear() : -1;
    const yearB = b.date ? b.date.getUTCFullYear() : -1;
    if (yearA !== yearB) return yearB - yearA;
    const timeA = a.date ? a.date.getTime() : -1;
    const timeB = b.date ? b.date.getTime() : -1;
    if (timeA !== timeB) return timeB - timeA;
    return a.title.localeCompare(b.title, "de");
  });
}

/** Mark exactly one concert as active, or clear all when concertId is null. */
export async function setActiveConcert(concertId: string | null) {
  if (!concertId) {
    await prisma.concert.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
    return null;
  }

  const existing = await prisma.concert.findUnique({
    where: { id: concertId },
    select: { id: true, title: true },
  });
  if (!existing) throw new Error("Konzert nicht gefunden");

  await clearOtherCurrent(concertId);
  return prisma.concert.update({
    where: { id: concertId },
    data: { isCurrent: true },
    include: {
      _count: { select: { items: true, recordings: true } },
    },
  });
}

export async function getConcertAdmin(id: string) {
  return prisma.concert.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: itemInclude,
      },
      _count: { select: { items: true, recordings: true } },
    },
  });
}

async function clearOtherCurrent(exceptId?: string) {
  await prisma.concert.updateMany({
    where: {
      isCurrent: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isCurrent: false },
  });
}

export async function createConcert(
  input: ConcertWriteInput & { title: string },
) {
  const title = input.title.trim();
  if (!title) throw new Error("Titel ist Pflicht");
  const slug = await uniqueConcertSlug(input.slug?.trim() || title);

  const startsAt = parseOptionalBerlinDateTime(input.startsAt, "startsAt");
  const endsAt = parseOptionalBerlinDateTime(input.endsAt, "endsAt");
  const websiteStatus = parseWebsiteStatus(input.websiteStatus) ?? "DRAFT";
  const resolvedStartsAt = startsAt === undefined ? null : startsAt;
  const resolvedEndsAt = endsAt === undefined ? null : endsAt;
  assertWebsitePublishRules({
    websiteStatus,
    startsAt: resolvedStartsAt,
    endsAt: resolvedEndsAt,
  });

  const date =
    resolvedStartsAt != null
      ? berlinCalendarDateUtc(resolvedStartsAt)
      : input.date
        ? new Date(`${input.date}T00:00:00.000Z`)
        : null;

  return prisma
    .$transaction(async (tx) => {
      if (input.isCurrent) {
        await tx.concert.updateMany({
          where: { isCurrent: true },
          data: { isCurrent: false },
        });
      }

      return tx.concert.create({
        data: {
          title,
          slug,
          date,
          startsAt: resolvedStartsAt,
          endsAt: resolvedEndsAt,
          subtitle: input.subtitle?.trim() || null,
          description: input.description?.trim() || null,
          location: input.location?.trim() || null,
          address: input.address?.trim() || null,
          programInfo: input.programInfo?.trim() || null,
          leader: input.leader?.trim() || null,
          admissionInfo: input.admissionInfo?.trim() || null,
          footer: input.footer?.trim() || null,
          extraInfo: input.extraInfo?.trim() || null,
          ticketUrl: input.ticketUrl?.trim() || null,
          websiteStatus,
          heroImageId: input.heroImageId?.trim() || null,
          isCurrent: Boolean(input.isCurrent),
          notes: input.notes?.trim() || null,
          isVisible: true,
        },
        include: {
          _count: { select: { items: true, recordings: true } },
        },
      });
    })
    .then((created) => {
      revalidatePublicConcerts();
      return created;
    });
}

export async function updateConcert(id: string, input: ConcertWriteInput) {
  const existing = await prisma.concert.findUnique({ where: { id } });
  if (!existing) throw new Error("Konzert nicht gefunden");

  const title =
    input.title !== undefined ? input.title.trim() : existing.title;
  if (!title) throw new Error("Titel ist Pflicht");

  const slug =
    input.slug !== undefined
      ? await uniqueConcertSlug(input.slug?.trim() || title, id)
      : existing.slug;

  const startsAt = parseOptionalBerlinDateTime(input.startsAt, "startsAt");
  const endsAt = parseOptionalBerlinDateTime(input.endsAt, "endsAt");
  const nextStartsAt =
    startsAt !== undefined ? startsAt : existing.startsAt;
  const nextEndsAt = endsAt !== undefined ? endsAt : existing.endsAt;
  const nextWebsiteStatus =
    parseWebsiteStatus(input.websiteStatus) ?? existing.websiteStatus;
  assertWebsitePublishRules({
    websiteStatus: nextWebsiteStatus,
    startsAt: nextStartsAt,
    endsAt: nextEndsAt,
  });

  let nextDate = existing.date;
  if (startsAt !== undefined) {
    nextDate = startsAt ? berlinCalendarDateUtc(startsAt) : existing.date;
  } else if (input.date !== undefined) {
    nextDate = input.date ? new Date(`${input.date}T00:00:00.000Z`) : null;
  }

  return prisma
    .$transaction(async (tx) => {
      if (input.isCurrent) {
        await tx.concert.updateMany({
          where: { isCurrent: true, id: { not: id } },
          data: { isCurrent: false },
        });
      }

      return tx.concert.update({
        where: { id },
        data: {
          title,
          slug,
          date: nextDate,
          ...(startsAt !== undefined ? { startsAt } : {}),
          ...(endsAt !== undefined ? { endsAt } : {}),
          ...(input.subtitle !== undefined
            ? { subtitle: input.subtitle?.trim() || null }
            : {}),
          ...(input.description !== undefined
            ? { description: input.description?.trim() || null }
            : {}),
          ...(input.location !== undefined
            ? { location: input.location?.trim() || null }
            : {}),
          ...(input.address !== undefined
            ? { address: input.address?.trim() || null }
            : {}),
          ...(input.programInfo !== undefined
            ? { programInfo: input.programInfo?.trim() || null }
            : {}),
          ...(input.leader !== undefined
            ? { leader: input.leader?.trim() || null }
            : {}),
          ...(input.admissionInfo !== undefined
            ? { admissionInfo: input.admissionInfo?.trim() || null }
            : {}),
          ...(input.footer !== undefined
            ? { footer: input.footer?.trim() || null }
            : {}),
          ...(input.extraInfo !== undefined
            ? { extraInfo: input.extraInfo?.trim() || null }
            : {}),
          ...(input.ticketUrl !== undefined
            ? { ticketUrl: input.ticketUrl?.trim() || null }
            : {}),
          ...(input.websiteStatus !== undefined
            ? { websiteStatus: nextWebsiteStatus }
            : {}),
          ...(input.heroImageId !== undefined
            ? { heroImageId: input.heroImageId?.trim() || null }
            : {}),
          ...(input.isCurrent !== undefined
            ? { isCurrent: input.isCurrent }
            : {}),
          ...(input.notes !== undefined
            ? { notes: input.notes?.trim() || null }
            : {}),
        },
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
            include: itemInclude,
          },
          _count: { select: { items: true, recordings: true } },
        },
      });
    })
    .then((updated) => {
      revalidatePublicConcerts();
      return updated;
    });
}

export async function deleteConcert(id: string) {
  await prisma.concert.delete({ where: { id } });
  revalidatePublicConcerts();
}

export async function upsertConcertItem(
  concertId: string,
  input: {
    id?: string;
    title: string;
    sortOrder?: number;
    ensemble?: VoiceGroup | null;
    sheetFileId?: string | null;
    audioFileId?: string | null;
  },
) {
  const title = input.title.trim();
  if (!title) throw new Error("Titel ist Pflicht");

  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    if (input.id) {
      const existing = await prisma.concertItem.findUnique({
        where: { id: input.id },
        select: { sortOrder: true },
      });
      sortOrder = existing?.sortOrder ?? 0;
    } else {
      const agg = await prisma.concertItem.aggregate({
        where: { concertId },
        _max: { sortOrder: true },
      });
      sortOrder = (agg._max.sortOrder ?? -1) + 1;
    }
  }

  const data = {
    title,
    sortOrder,
    ensemble: input.ensemble ?? null,
    sheetFileId: input.sheetFileId || null,
    audioFileId: input.audioFileId || null,
  };

  if (input.id) {
    return prisma.concertItem.update({
      where: { id: input.id },
      data,
      include: itemInclude,
    });
  }

  return prisma.concertItem.create({
    data: { concertId, ...data },
    include: itemInclude,
  });
}

export async function deleteConcertItem(id: string) {
  await prisma.concertItem.delete({ where: { id } });
}

/** Persist a full ordered id list as 0..n-1 sortOrder. */
export async function reorderConcertItems(
  concertId: string,
  orderedIds: string[],
) {
  const existing = await prisma.concertItem.findMany({
    where: { concertId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((row) => row.id));
  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Ungültige Reihenfolge");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.concertItem.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function listLibraryConcerts(input: {
  role: Role | string;
  q?: string;
}) {
  const isAdmin = hasPermission(input.role, "PIECE_MANAGE");
  return prisma.concert.findMany({
    where: {
      ...(isAdmin ? {} : { isVisible: true }),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { notes: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { items: true, recordings: true } },
    },
    orderBy: [{ isCurrent: "desc" }, { date: "desc" }, { title: "asc" }],
  });
}

export async function getLibraryConcert(input: {
  idOrSlug: string;
  role: Role | string;
  ensemble?: VoiceGroup | null;
}) {
  const isAdmin = hasPermission(input.role, "PIECE_MANAGE");
  const concert = await prisma.concert.findFirst({
    where: {
      OR: [{ id: input.idOrSlug }, { slug: input.idOrSlug }],
      ...(isAdmin ? {} : { isVisible: true }),
    },
    include: {
      items: {
        ...(input.ensemble
          ? {
              where: {
                OR: [{ ensemble: input.ensemble }, { ensemble: null }],
              },
            }
          : {}),
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: itemInclude,
      },
      recordings: {
        where: {
          storedFile: { uploadStatus: "READY", deletedAt: null },
          ...(isAdmin ? {} : { isVisible: true }),
        },
        include: { storedFile: true },
        orderBy: [{ title: "asc" }],
      },
      _count: { select: { items: true, recordings: true } },
    },
  });
  return concert;
}

export async function getCurrentConcert(role: Role | string) {
  const isAdmin = hasPermission(role, "PIECE_MANAGE");
  return prisma.concert.findFirst({
    where: {
      isCurrent: true,
      ...(isAdmin ? {} : { isVisible: true }),
    },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: itemInclude,
      },
      recordings: {
        where: {
          storedFile: { uploadStatus: "READY", deletedAt: null },
          ...(isAdmin ? {} : { isVisible: true }),
        },
        include: { storedFile: true },
        orderBy: [{ title: "asc" }],
      },
      _count: { select: { items: true, recordings: true } },
    },
  });
}

/** Lightweight current-concert fields for dashboard cards (no program/audio payload). */
export async function getCurrentConcertSummary(role: Role | string) {
  const isAdmin = hasPermission(role, "PIECE_MANAGE");
  const concert = await prisma.concert.findFirst({
    where: {
      isCurrent: true,
      ...(isAdmin ? {} : { isVisible: true }),
    },
    select: {
      title: true,
      date: true,
      location: true,
    },
  });
  if (!concert) return null;
  const date = concert.date ? concert.date.toISOString().slice(0, 10) : null;
  return {
    title: concert.title,
    date,
    year: date ? Number(date.slice(0, 4)) : null,
    location: concert.location ?? null,
  };
}
