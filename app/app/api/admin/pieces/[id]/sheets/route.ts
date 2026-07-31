import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import type {
  FileAccessScope,
  SheetType,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { getPieceById, serializePiece } from "@/lib/pieces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id: pieceId } = await params;
  const piece = await getPieceById(pieceId);
  if (!piece) {
    return NextResponse.json(
      { detail: "Stück nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    storedFileId?: string;
    sheetType?: SheetType;
    voiceGroup?: VoiceGroup | null;
    accessScope?: FileAccessScope;
    version?: string;
    changelog?: string | null;
    publish?: boolean;
  };

  if (!body.storedFileId) {
    return NextResponse.json(
      { detail: "storedFileId fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  const stored = await prisma.storedFile.findUnique({
    where: { id: body.storedFileId },
  });
  if (
    !stored ||
    stored.deletedAt ||
    stored.uploadStatus !== "READY" ||
    stored.category !== "SHEET"
  ) {
    return NextResponse.json(
      { detail: "Datei nicht bereit", code: "validation_error" },
      { status: 400 },
    );
  }

  const publish = Boolean(body.publish);
  await prisma.sheetFile.create({
    data: {
      pieceId,
      storedFileId: stored.id,
      sheetType: body.sheetType ?? "OTHER",
      voiceGroup: body.voiceGroup ?? null,
      accessScope: body.accessScope ?? "ALL_MEMBERS",
      version: body.version?.trim() || "1",
      changelog: body.changelog?.trim() || null,
      publishedAt: publish ? new Date() : null,
    },
  });

  await writeAuditLog({
    action: "piece.sheet_attached",
    entityType: "music_piece",
    entityId: pieceId,
    actorUserId: gate.user.id,
    metadata: {
      storedFileId: stored.id,
      sheetType: body.sheetType ?? "OTHER",
      published: publish,
    },
  });

  const updated = await getPieceById(pieceId);
  return NextResponse.json(serializePiece(updated!), { status: 201 });
}
