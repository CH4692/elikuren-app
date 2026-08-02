import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { serializeGalleryImage } from "@/lib/gallery";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await prisma.galleryImage.findUnique({
    where: { id },
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
  if (!existing) {
    return NextResponse.json(
      { detail: "Bild nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    title?: string;
    caption?: string | null;
    takenAt?: string | null;
    isVisible?: boolean;
    sortOrder?: number;
  };

  const title =
    body.title !== undefined ? String(body.title).trim() : existing.title;
  if (!title) {
    return NextResponse.json(
      { detail: "Titel ist Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  const updated = await prisma.galleryImage.update({
    where: { id },
    data: {
      title,
      ...(body.caption !== undefined
        ? { caption: body.caption?.trim() || null }
        : {}),
      ...(body.takenAt !== undefined
        ? {
            takenAt: body.takenAt
              ? new Date(`${body.takenAt}T00:00:00.000Z`)
              : null,
          }
        : {}),
      ...(body.isVisible !== undefined ? { isVisible: body.isVisible } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
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

  return NextResponse.json(serializeGalleryImage(updated));
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { detail: "Bild nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.galleryImage.delete({ where: { id } }),
    prisma.storedFile.update({
      where: { id: existing.storedFileId },
      data: { deletedAt: new Date(), uploadStatus: "DELETED" },
    }),
  ]);

  return NextResponse.json({ deleted: true });
}
