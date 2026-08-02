import { prisma } from "@/lib/db";
import type { Role, VoiceGroup } from "@/lib/generated/prisma/client";
import { hasPermission } from "@/lib/permissions";

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

/** Display label for concert assignments, e.g. "Sommerkonzert 2025". */
export function formatConcertLabel(input: {
  title: string;
  year?: number | null;
  date?: string | Date | null;
}): string {
  const title = input.title.trim();
  let year = input.year ?? null;
  if (year == null && input.date) {
    if (typeof input.date === "string") {
      const parsed = Number(input.date.slice(0, 4));
      year = Number.isFinite(parsed) ? parsed : null;
    } else {
      year = input.date.getUTCFullYear();
    }
  }
  if (year != null && !/\b\d{4}\s*$/.test(title)) {
    return `${title} ${year}`;
  }
  return title;
}

export async function uniqueConcertSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "konzert";
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

export function serializeConcert(concert: {
  id: string;
  title: string;
  slug: string;
  date: Date | null;
  location?: string | null;
  isCurrent: boolean;
  notes: string | null;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: Parameters<typeof serializeConcertItem>[0][];
  _count?: { items: number; recordings: number };
}) {
  const date = concert.date ? concert.date.toISOString().slice(0, 10) : null;
  const year = date ? Number(date.slice(0, 4)) : null;
  return {
    id: concert.id,
    title: concert.title,
    label: formatConcertLabel({ title: concert.title, year, date }),
    slug: concert.slug,
    date,
    year,
    location: concert.location ?? null,
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

export async function createConcert(input: {
  title: string;
  slug?: string | null;
  date?: string | null;
  location?: string | null;
  isCurrent?: boolean;
  notes?: string | null;
}) {
  const title = input.title.trim();
  if (!title) throw new Error("Titel ist Pflicht");
  const slug = await uniqueConcertSlug(input.slug?.trim() || title);
  if (input.isCurrent) await clearOtherCurrent();

  return prisma.concert.create({
    data: {
      title,
      slug,
      date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : null,
      location: input.location?.trim() || null,
      isCurrent: Boolean(input.isCurrent),
      notes: input.notes?.trim() || null,
      isVisible: true,
    },
    include: {
      _count: { select: { items: true, recordings: true } },
    },
  });
}

export async function updateConcert(
  id: string,
  input: {
    title?: string;
    slug?: string | null;
    date?: string | null;
    location?: string | null;
    isCurrent?: boolean;
    notes?: string | null;
  },
) {
  const existing = await prisma.concert.findUnique({ where: { id } });
  if (!existing) throw new Error("Konzert nicht gefunden");

  const title =
    input.title !== undefined ? input.title.trim() : existing.title;
  if (!title) throw new Error("Titel ist Pflicht");

  const slug =
    input.slug !== undefined
      ? await uniqueConcertSlug(input.slug?.trim() || title, id)
      : existing.slug;

  if (input.isCurrent) await clearOtherCurrent(id);

  return prisma.concert.update({
    where: { id },
    data: {
      title,
      slug,
      ...(input.date !== undefined
        ? { date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : null }
        : {}),
      ...(input.location !== undefined
        ? { location: input.location?.trim() || null }
        : {}),
      ...(input.isCurrent !== undefined ? { isCurrent: input.isCurrent } : {}),
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
}

export async function deleteConcert(id: string) {
  await prisma.concert.delete({ where: { id } });
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
