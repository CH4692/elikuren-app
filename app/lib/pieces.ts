import type {
  AudioFile,
  MusicPiece,
  SheetFile,
  StoredFile,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

export type PieceWithFiles = MusicPiece & {
  sheetFiles: (SheetFile & { storedFile: StoredFile })[];
  audioFiles: (AudioFile & { storedFile: StoredFile })[];
};

export function serializePiece(piece: PieceWithFiles) {
  return {
    id: piece.id,
    title: piece.title,
    composer: piece.composer,
    arranger: piece.arranger,
    category: piece.category,
    epoch: piece.epoch,
    instrumentation: piece.instrumentation,
    difficulty: piece.difficulty,
    rehearsal_status: piece.rehearsalStatus,
    publication_status: piece.publicationStatus,
    rehearsal_notes: piece.rehearsalNotes,
    description: piece.description,
    published_at: piece.publishedAt?.toISOString() ?? null,
    created_at: piece.createdAt.toISOString(),
    updated_at: piece.updatedAt.toISOString(),
    sheet_files: piece.sheetFiles.map((sheet) => ({
      id: sheet.id,
      sheet_type: sheet.sheetType,
      voice_group: sheet.voiceGroup,
      access_scope: sheet.accessScope,
      version: sheet.version,
      is_current: sheet.isCurrent,
      changelog: sheet.changelog,
      published_at: sheet.publishedAt?.toISOString() ?? null,
      sort_order: sheet.sortOrder,
      stored_file: {
        id: sheet.storedFile.id,
        original_name: sheet.storedFile.originalName,
        mime_type: sheet.storedFile.mimeType,
        size_bytes: sheet.storedFile.sizeBytes,
        upload_status: sheet.storedFile.uploadStatus,
      },
    })),
    audio_files: piece.audioFiles.map((audio) => ({
      id: audio.id,
      audio_type: audio.audioType,
      voice_group: audio.voiceGroup,
      access_scope: audio.accessScope,
      duration_seconds: audio.durationSeconds,
      sort_order: audio.sortOrder,
      published_at: audio.publishedAt?.toISOString() ?? null,
      stored_file: {
        id: audio.storedFile.id,
        original_name: audio.storedFile.originalName,
        mime_type: audio.storedFile.mimeType,
        size_bytes: audio.storedFile.sizeBytes,
        upload_status: audio.storedFile.uploadStatus,
      },
    })),
  };
}

export async function getPieceById(id: string) {
  return prisma.musicPiece.findUnique({
    where: { id },
    include: {
      sheetFiles: {
        where: { storedFile: { deletedAt: null } },
        include: { storedFile: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      audioFiles: {
        where: { storedFile: { deletedAt: null } },
        include: { storedFile: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function listPiecesAdmin() {
  return prisma.musicPiece.findMany({
    include: {
      sheetFiles: {
        where: { storedFile: { deletedAt: null } },
        include: { storedFile: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      audioFiles: {
        where: { storedFile: { deletedAt: null } },
        include: { storedFile: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}
