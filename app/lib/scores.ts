import { prisma } from "@/lib/db";
import type { FileAccessScope, VoiceGroup } from "@/lib/generated/prisma/client";

export function serializeScore(
  sheet: {
    id: string;
    title: string;
    composer: string;
    voiceGroup: VoiceGroup | null;
    accessScope: FileAccessScope;
    isVisible: boolean;
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
  },
) {
  return {
    id: sheet.id,
    title: sheet.title,
    composer: sheet.composer,
    voice_group: sheet.voiceGroup,
    access_scope: sheet.accessScope,
    is_visible: sheet.isVisible,
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
            ],
          }
        : {}),
    },
    include: {
      storedFile: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          uploadStatus: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
  });
}

export async function createScore(input: {
  storedFileId: string;
  title: string;
  composer?: string | null;
  voiceGroup?: VoiceGroup | null;
  accessScope?: FileAccessScope;
  isVisible?: boolean;
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

  return prisma.sheetFile.create({
    data: {
      title,
      composer: String(input.composer ?? "").trim(),
      storedFileId: stored.id,
      voiceGroup: input.voiceGroup ?? null,
      accessScope: input.accessScope ?? "ALL_MEMBERS",
      isVisible: input.isVisible !== false,
    },
    include: {
      storedFile: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          uploadStatus: true,
        },
      },
    },
  });
}
