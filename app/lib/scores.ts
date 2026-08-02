import { formatConcertLabel } from "@/lib/concerts";
import { prisma } from "@/lib/db";
import type { FileAccessScope, VoiceGroup } from "@/lib/generated/prisma/client";

const storedFileSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  sizeBytes: true,
  uploadStatus: true,
} as const;

const concertSelect = {
  id: true,
  title: true,
  date: true,
} as const;

export function serializeScore(
  sheet: {
    id: string;
    title: string;
    composer: string;
    voiceGroup: VoiceGroup | null;
    accessScope: FileAccessScope;
    isVisible: boolean;
    concertId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    storedFileId: string;
    storedFile: {
      id: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      uploadStatus: string;
    };
    concert?: { id: string; title: string; date: Date | null } | null;
  },
) {
  const concertDate = sheet.concert?.date
    ? sheet.concert.date.toISOString().slice(0, 10)
    : null;
  const concertYear = concertDate ? Number(concertDate.slice(0, 4)) : null;
  return {
    id: sheet.id,
    title: sheet.title,
    composer: sheet.composer,
    voice_group: sheet.voiceGroup,
    access_scope: sheet.accessScope,
    is_visible: sheet.isVisible,
    concert_id: sheet.concertId ?? sheet.concert?.id ?? null,
    concert: sheet.concert
      ? {
          id: sheet.concert.id,
          title: sheet.concert.title,
          year: concertYear,
          date: concertDate,
          label: formatConcertLabel({
            title: sheet.concert.title,
            year: concertYear,
            date: concertDate,
          }),
        }
      : null,
    stored_file: {
      id: sheet.storedFile.id,
      original_name: sheet.storedFile.originalName,
      mime_type: sheet.storedFile.mimeType,
      size_bytes: sheet.storedFile.sizeBytes,
      upload_status: sheet.storedFile.uploadStatus,
    },
    created_at: sheet.createdAt.toISOString(),
    updated_at: sheet.updatedAt.toISOString(),
  };
}

export async function listScoresAdmin(q?: string) {
  return prisma.sheetFile.findMany({
    where: {
      storedFile: { deletedAt: null },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { composer: { contains: q, mode: "insensitive" } },
              {
                storedFile: {
                  originalName: { contains: q, mode: "insensitive" },
                },
              },
              {
                concert: {
                  title: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      storedFile: { select: storedFileSelect },
      concert: { select: concertSelect },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 2000,
  });
}

export async function createScore(input: {
  storedFileId: string;
  title: string;
  composer?: string | null;
  voiceGroup?: VoiceGroup | null;
  accessScope?: FileAccessScope;
  concertId: string;
}) {
  const stored = await prisma.storedFile.findUnique({
    where: { id: input.storedFileId },
  });
  if (
    !stored ||
    stored.deletedAt ||
    stored.uploadStatus !== "READY" ||
    stored.category !== "SHEET"
  ) {
    throw new Error("Datei nicht bereit");
  }

  const title = input.title.trim();
  if (!title) throw new Error("Titel ist Pflicht");
  if (!input.concertId) throw new Error("Konzert ist Pflicht");

  const concert = await prisma.concert.findUnique({
    where: { id: input.concertId },
    select: { id: true },
  });
  if (!concert) throw new Error("Konzert nicht gefunden");

  return prisma.sheetFile.create({
    data: {
      title,
      composer: String(input.composer ?? "").trim(),
      storedFileId: stored.id,
      voiceGroup: input.voiceGroup ?? null,
      accessScope: input.accessScope ?? "ALL_MEMBERS",
      isVisible: true,
      concertId: concert.id,
    },
    include: {
      storedFile: { select: storedFileSelect },
      concert: { select: concertSelect },
    },
  });
}
