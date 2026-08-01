import { NextResponse } from "next/server";

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
  };

  const title =
    body.title !== undefined ? String(body.title).trim() : existing.title;
  if (!title) {
    return NextResponse.json(
      { detail: "Titel ist Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  const piece = await prisma.musicPiece.update({
    where: { id },
    data: {
      title,
      composer:
        body.composer !== undefined
          ? String(body.composer).trim()
          : undefined,
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
    data: { rehearsalStatus: "ARCHIVED" },
  });

  return NextResponse.json({ archived: true });
}
