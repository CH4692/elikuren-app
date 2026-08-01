import { prisma } from "@/lib/db";
import { canAccessScopedFile, normalizeVoiceLabel } from "@/lib/files";
import type { AudioType, Role, VoiceGroup } from "@/lib/generated/prisma/client";
import { hasPermission } from "@/lib/permissions";

function canSeeLibraryEntry(input: {
  isVisible: boolean;
  accessScope: "ALL_MEMBERS" | "VOICE_GROUP_ONLY" | "ADMIN_ONLY";
  voiceGroup: VoiceGroup | null;
  role: Role | string;
  voice: string | null;
}) {
  if (hasPermission(input.role, "PIECE_MANAGE")) return true;
  if (!input.isVisible) return false;
  return canAccessScopedFile({
    accessScope: input.accessScope,
    fileVoiceGroup: input.voiceGroup,
    userRole: input.role,
    userVoice: input.voice,
  });
}

export async function listLibraryScores(input: {
  role: Role | string;
  voice: string | null;
  q?: string;
  myVoiceOnly?: boolean;
}) {
  const myVoice = normalizeVoiceLabel(input.voice);
  const sheets = await prisma.sheetFile.findMany({
    where: {
      storedFile: { uploadStatus: "READY", deletedAt: null },
      ...(hasPermission(input.role, "PIECE_MANAGE")
        ? {}
        : { isVisible: true }),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { composer: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { storedFile: true },
    orderBy: [{ title: "asc" }, { createdAt: "desc" }],
  });

  return sheets
    .filter((sheet) =>
      canSeeLibraryEntry({
        isVisible: sheet.isVisible,
        accessScope: sheet.accessScope,
        voiceGroup: sheet.voiceGroup,
        role: input.role,
        voice: input.voice,
      }),
    )
    .filter((sheet) => {
      if (!input.myVoiceOnly || !myVoice) return true;
      return sheet.voiceGroup === myVoice || sheet.voiceGroup == null;
    })
    .map((sheet) => ({
      id: sheet.id,
      title: sheet.title,
      composer: sheet.composer,
      voice_group: sheet.voiceGroup,
      access_scope: sheet.accessScope,
      is_my_voice: myVoice != null && sheet.voiceGroup === myVoice,
      stored_file_id: sheet.storedFileId,
      original_name: sheet.storedFile.originalName,
      mime_type: sheet.storedFile.mimeType,
      created_at: sheet.createdAt.toISOString(),
    }));
}

export async function listLibraryAudio(input: {
  role: Role | string;
  voice: string | null;
  q?: string;
  myVoiceOnly?: boolean;
  audioType?: AudioType | null;
}) {
  const myVoice = normalizeVoiceLabel(input.voice);
  const audios = await prisma.audioFile.findMany({
    where: {
      storedFile: { uploadStatus: "READY", deletedAt: null },
      ...(hasPermission(input.role, "PIECE_MANAGE")
        ? {}
        : { isVisible: true }),
      ...(input.audioType ? { audioType: input.audioType } : {}),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { composer: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { storedFile: true },
    orderBy: [{ title: "asc" }, { createdAt: "desc" }],
  });

  return audios
    .filter((audio) =>
      canSeeLibraryEntry({
        isVisible: audio.isVisible,
        accessScope: audio.accessScope,
        voiceGroup: audio.voiceGroup,
        role: input.role,
        voice: input.voice,
      }),
    )
    .filter((audio) => {
      if (!input.myVoiceOnly || !myVoice) return true;
      return audio.voiceGroup === myVoice || audio.voiceGroup == null;
    })
    .map((audio) => ({
      id: audio.id,
      title: audio.title,
      composer: audio.composer,
      audio_type: audio.audioType,
      voice_group: audio.voiceGroup,
      access_scope: audio.accessScope,
      is_my_voice: myVoice != null && audio.voiceGroup === myVoice,
      stored_file_id: audio.storedFileId,
      original_name: audio.storedFile.originalName,
      mime_type: audio.storedFile.mimeType,
      duration_seconds: audio.durationSeconds,
      created_at: audio.createdAt.toISOString(),
    }));
}
