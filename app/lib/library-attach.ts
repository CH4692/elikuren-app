import { prisma } from "@/lib/db";
import type {
  AudioType,
  FileAccessScope,
  SheetType,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { getPieceById, serializePiece } from "@/lib/pieces";

export type AttachLibraryInput = {
  storedFileId: string;
  kind: "sheet" | "audio";
  pieceId?: string | null;
  title?: string | null;
  composer?: string | null;
  sheetType?: SheetType;
  audioType?: AudioType;
  voiceGroup?: VoiceGroup | null;
  accessScope?: FileAccessScope;
  isVisible?: boolean;
};

/**
 * Attach a READY stored file to an existing or newly created piece.
 * Files are visible to members by default (isVisible: true).
 */
export async function attachLibraryFile(input: AttachLibraryInput) {
  const stored = await prisma.storedFile.findUnique({
    where: { id: input.storedFileId },
  });
  if (!stored || stored.deletedAt || stored.uploadStatus !== "READY") {
    throw new AttachError("Datei nicht bereit", "validation_error", 400);
  }

  const expectedCategory = input.kind === "sheet" ? "SHEET" : "AUDIO";
  if (stored.category !== expectedCategory) {
    throw new AttachError(
      `Datei ist kein ${input.kind === "sheet" ? "PDF" : "Audio"}`,
      "validation_error",
      400,
    );
  }

  let pieceId = input.pieceId?.trim() || null;
  if (pieceId) {
    const existing = await prisma.musicPiece.findUnique({
      where: { id: pieceId },
      select: { id: true },
    });
    if (!existing) {
      throw new AttachError("Stück nicht gefunden", "http_404", 404);
    }
  } else {
    const title = String(input.title ?? "").trim();
    if (!title) {
      throw new AttachError(
        "Titel ist Pflicht, wenn kein Stück gewählt wird",
        "validation_error",
        400,
      );
    }
    const created = await prisma.musicPiece.create({
      data: {
        title,
        composer: String(input.composer ?? "").trim(),
      },
    });
    pieceId = created.id;
  }

  const isVisible = input.isVisible !== false;
  const accessScope = input.accessScope ?? "ALL_MEMBERS";
  const voiceGroup = input.voiceGroup ?? null;

  if (input.kind === "sheet") {
    await prisma.sheetFile.create({
      data: {
        pieceId,
        storedFileId: stored.id,
        sheetType: input.sheetType ?? "OTHER",
        voiceGroup,
        accessScope,
        isVisible,
      },
    });
  } else {
    await prisma.audioFile.create({
      data: {
        pieceId,
        storedFileId: stored.id,
        audioType: input.audioType ?? "OTHER",
        voiceGroup,
        accessScope,
        isVisible,
      },
    });
  }

  const piece = await getPieceById(pieceId);
  return serializePiece(piece!);
}

export class AttachError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}
