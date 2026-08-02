import { prisma } from "@/lib/db";
import type {
  AudioType,
  FileAccessScope,
  VoiceGroup,
} from "@/lib/generated/prisma/client";

export function serializeAudio(
  audio: {
    id: string;
    title: string;
    composer: string;
    audioType: AudioType;
    voiceGroup: VoiceGroup | null;
    accessScope: FileAccessScope;
    durationSeconds: number | null;
    isVisible: boolean;
    concertId?: string | null;
    createdAt: Date;
    updatedAt: Date;
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
    id: audio.id,
    title: audio.title,
    composer: audio.composer,
    audio_type: audio.audioType,
    voice_group: audio.voiceGroup,
    access_scope: audio.accessScope,
    duration_seconds: audio.durationSeconds,
    is_visible: audio.isVisible,
    concert_id: audio.concertId ?? null,
    stored_file: {
      id: audio.storedFile.id,
      original_name: audio.storedFile.originalName,
      mime_type: audio.storedFile.mimeType,
      size_bytes: audio.storedFile.sizeBytes,
      upload_status: audio.storedFile.uploadStatus,
    },
    created_at: audio.createdAt.toISOString(),
    updated_at: audio.updatedAt.toISOString(),
  };
}

export async function listAudioAdmin(q?: string) {
  return prisma.audioFile.findMany({
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
    take: 2000,
  });
}

export async function createAudio(input: {
  storedFileId: string;
  title: string;
  composer?: string | null;
  voiceGroup?: VoiceGroup | null;
  audioType?: AudioType;
  accessScope?: FileAccessScope;
  concertId?: string | null;
}) {
  const stored = await prisma.storedFile.findUnique({
    where: { id: input.storedFileId },
  });
  if (
    !stored ||
    stored.deletedAt ||
    stored.uploadStatus !== "READY" ||
    stored.category !== "AUDIO"
  ) {
    throw new Error("Datei nicht bereit");
  }

  const title = input.title.trim();
  if (!title) throw new Error("Titel ist Pflicht");

  return prisma.audioFile.create({
    data: {
      title,
      composer: String(input.composer ?? "").trim(),
      storedFileId: stored.id,
      voiceGroup: input.voiceGroup ?? null,
      audioType: input.audioType ?? "OTHER",
      accessScope: input.accessScope ?? "ALL_MEMBERS",
      isVisible: true,
      concertId: input.concertId || null,
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
