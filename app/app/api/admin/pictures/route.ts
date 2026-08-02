import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  createGalleryImage,
  listGalleryImagesAdmin,
  serializeGalleryImage,
} from "@/lib/gallery";

export async function GET(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const items = await listGalleryImagesAdmin(q || undefined);
  return NextResponse.json({ items: items.map(serializeGalleryImage) });
}

export async function POST(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    storedFileId?: string;
    title?: string;
    caption?: string | null;
    takenAt?: string | null;
    isVisible?: boolean;
    sortOrder?: number;
  };

  if (!body.storedFileId) {
    return NextResponse.json(
      { detail: "storedFileId fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const image = await createGalleryImage({
      storedFileId: body.storedFileId,
      title: String(body.title ?? ""),
      caption: body.caption,
      takenAt: body.takenAt,
      isVisible: body.isVisible,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json(serializeGalleryImage(image), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Anlegen fehlgeschlagen";
    return NextResponse.json(
      { detail: message, code: "validation_error" },
      { status: 400 },
    );
  }
}
