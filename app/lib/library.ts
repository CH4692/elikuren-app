import { prisma } from "@/lib/db";
import { canAccessScopedFile, normalizeVoiceLabel } from "@/lib/files";
import type { Role } from "@/lib/generated/prisma/client";
import { hasPermission } from "@/lib/permissions";

/** Pieces with visible, ready files the user may access. */
export async function listLibraryPiecesForUser(input: {
  role: Role | string;
  voice: string | null;
  q?: string;
}) {
  const pieces = await prisma.musicPiece.findMany({
    where: {
      rehearsalStatus: { not: "ARCHIVED" },
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { composer: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      sheetFiles: {
        where: {
          isVisible: true,
          storedFile: { uploadStatus: "READY", deletedAt: null },
        },
        include: { storedFile: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      audioFiles: {
        where: {
          isVisible: true,
          storedFile: { uploadStatus: "READY", deletedAt: null },
        },
        include: { storedFile: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ title: "asc" }],
  });

  const isAdmin = hasPermission(input.role, "PIECE_MANAGE");

  return pieces
    .map((piece) => ({
      ...piece,
      sheetFiles: piece.sheetFiles.filter((sheet) =>
        canAccessScopedFile({
          accessScope: sheet.accessScope,
          fileVoiceGroup: sheet.voiceGroup,
          userRole: input.role,
          userVoice: input.voice,
        }),
      ),
      audioFiles: piece.audioFiles.filter((audio) =>
        canAccessScopedFile({
          accessScope: audio.accessScope,
          fileVoiceGroup: audio.voiceGroup,
          userRole: input.role,
          userVoice: input.voice,
        }),
      ),
    }))
    .filter(
      (piece) =>
        isAdmin || piece.sheetFiles.length > 0 || piece.audioFiles.length > 0,
    );
}

/** @deprecated Prefer listLibraryPiecesForUser */
export const listPublishedPiecesForUser = listLibraryPiecesForUser;

export function serializeLibraryPiece(
  piece: Awaited<ReturnType<typeof listLibraryPiecesForUser>>[number],
  userVoice: string | null,
) {
  const myVoice = normalizeVoiceLabel(userVoice);
  return {
    id: piece.id,
    title: piece.title,
    composer: piece.composer,
    arranger: piece.arranger,
    category: piece.category,
    epoch: piece.epoch,
    rehearsal_status: piece.rehearsalStatus,
    rehearsal_notes: piece.rehearsalNotes,
    description: piece.description,
    sheet_files: piece.sheetFiles.map((sheet) => ({
      id: sheet.id,
      sheet_type: sheet.sheetType,
      voice_group: sheet.voiceGroup,
      access_scope: sheet.accessScope,
      version: sheet.version,
      is_my_voice: myVoice != null && sheet.voiceGroup === myVoice,
      stored_file_id: sheet.storedFileId,
      original_name: sheet.storedFile.originalName,
      mime_type: sheet.storedFile.mimeType,
    })),
    audio_files: piece.audioFiles.map((audio) => ({
      id: audio.id,
      audio_type: audio.audioType,
      voice_group: audio.voiceGroup,
      access_scope: audio.accessScope,
      is_my_voice: myVoice != null && audio.voiceGroup === myVoice,
      stored_file_id: audio.storedFileId,
      original_name: audio.storedFile.originalName,
      mime_type: audio.storedFile.mimeType,
      duration_seconds: audio.durationSeconds,
    })),
  };
}
