import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { listPublishedPiecesForUser, serializeLibraryPiece } from "@/lib/library";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requirePermission("MEMBER_CONTENT_READ");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const pieces = await listPublishedPiecesForUser({
    role: gate.user.role,
    voice: gate.user.voice,
  });
  const piece = pieces.find((item) => item.id === id);
  if (!piece) {
    return NextResponse.json(
      { detail: "Stück nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await prisma.userContentEvent.create({
    data: {
      userId: gate.user.id,
      eventType: "VIEWED",
      targetType: "PIECE",
      targetId: piece.id,
    },
  });

  await writeAuditLog({
    action: "library.piece_viewed",
    entityType: "music_piece",
    entityId: piece.id,
    actorUserId: gate.user.id,
  });

  return NextResponse.json(serializeLibraryPiece(piece, gate.user.voice));
}
