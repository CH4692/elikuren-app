import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { getPieceById, serializePiece } from "@/lib/pieces";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const piece = await getPieceById(id);
  if (!piece) {
    return NextResponse.json(
      { detail: "Stück nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }
  return NextResponse.json(serializePiece(piece));
}

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getPieceById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Stück nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

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
    publicationStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  };

  const title =
    body.title !== undefined ? String(body.title).trim() : existing.title;
  const composer =
    body.composer !== undefined
      ? String(body.composer).trim()
      : existing.composer;
  if (!title || !composer) {
    return NextResponse.json(
      { detail: "Titel und Komponist sind Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  let publicationStatus = existing.publicationStatus;
  let publishedAt = existing.publishedAt;
  if (body.publicationStatus) {
    publicationStatus = body.publicationStatus;
    if (publicationStatus === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }
    if (publicationStatus !== "PUBLISHED") {
      publishedAt = publicationStatus === "DRAFT" ? null : publishedAt;
    }
  }

  const piece = await prisma.musicPiece.update({
    where: { id },
    data: {
      title,
      composer,
      arranger:
        body.arranger !== undefined
          ? body.arranger?.trim() || null
          : undefined,
      category:
        body.category !== undefined
          ? body.category?.trim() || null
          : undefined,
      epoch: body.epoch !== undefined ? body.epoch?.trim() || null : undefined,
      instrumentation:
        body.instrumentation !== undefined
          ? body.instrumentation?.trim() || null
          : undefined,
      difficulty:
        body.difficulty !== undefined
          ? body.difficulty?.trim() || null
          : undefined,
      rehearsalNotes:
        body.rehearsalNotes !== undefined
          ? body.rehearsalNotes?.trim() || null
          : undefined,
      description:
        body.description !== undefined
          ? body.description?.trim() || null
          : undefined,
      rehearsalStatus: body.rehearsalStatus,
      publicationStatus,
      publishedAt,
    },
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

  await writeAuditLog({
    action: "piece.updated",
    entityType: "music_piece",
    entityId: piece.id,
    actorUserId: gate.user.id,
    metadata: {
      publicationStatus: piece.publicationStatus,
      rehearsalStatus: piece.rehearsalStatus,
    },
  });

  return NextResponse.json(serializePiece(piece));
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getPieceById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Stück nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await prisma.musicPiece.update({
    where: { id },
    data: { publicationStatus: "ARCHIVED" },
  });

  await writeAuditLog({
    action: "piece.archived",
    entityType: "music_piece",
    entityId: id,
    actorUserId: gate.user.id,
  });

  return NextResponse.json({ archived: true });
}
