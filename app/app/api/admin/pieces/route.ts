import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { listPiecesAdmin, serializePiece } from "@/lib/pieces";

export async function GET() {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const pieces = await listPiecesAdmin();
  return NextResponse.json({
    items: pieces.map(serializePiece),
  });
}

export async function POST(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    title?: string;
    composer?: string;
    arranger?: string | null;
    category?: string | null;
    epoch?: string | null;
    instrumentation?: string | null;
    difficulty?: string | null;
    rehearsalNotes?: string | null;
    description?: string | null;
    rehearsalStatus?: "PLANNED" | "REHEARSING" | "PERFORMANCE_READY" | "ARCHIVED";
  };

  const title = String(body.title ?? "").trim();
  const composer = String(body.composer ?? "").trim();
  if (!title || !composer) {
    return NextResponse.json(
      { detail: "Titel und Komponist sind Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  const piece = await prisma.musicPiece.create({
    data: {
      title,
      composer,
      arranger: body.arranger?.trim() || null,
      category: body.category?.trim() || null,
      epoch: body.epoch?.trim() || null,
      instrumentation: body.instrumentation?.trim() || null,
      difficulty: body.difficulty?.trim() || null,
      rehearsalNotes: body.rehearsalNotes?.trim() || null,
      description: body.description?.trim() || null,
      rehearsalStatus: body.rehearsalStatus ?? "PLANNED",
      publicationStatus: "DRAFT",
    },
    include: {
      sheetFiles: { include: { storedFile: true } },
      audioFiles: { include: { storedFile: true } },
    },
  });

  await writeAuditLog({
    action: "piece.created",
    entityType: "music_piece",
    entityId: piece.id,
    actorUserId: gate.user.id,
    metadata: { title, composer },
  });

  return NextResponse.json(serializePiece(piece), { status: 201 });
}
