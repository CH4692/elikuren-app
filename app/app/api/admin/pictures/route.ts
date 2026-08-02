import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  createMediaAsset,
  listMediaAssetsAdmin,
  serializeMediaAsset,
} from "@/lib/gallery";

export async function GET(request: Request) {
  const gate = await requirePermission("MEDIA_MANAGE");
  if (!gate.ok) return gate.response;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const items = await listMediaAssetsAdmin(q || undefined);
  return NextResponse.json({ items: items.map(serializeMediaAsset) });
}

export async function POST(request: Request) {
  const gate = await requirePermission("MEDIA_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    storedFileId?: string;
    title?: string;
    altText?: string;
    isDecorative?: boolean;
    caption?: string | null;
    takenAt?: string | null;
    sortOrder?: number;
  };

  if (!body.storedFileId) {
    return NextResponse.json(
      { detail: "storedFileId fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const image = await createMediaAsset({
      storedFileId: body.storedFileId,
      title: String(body.title ?? ""),
      altText: body.altText,
      isDecorative: body.isDecorative,
      caption: body.caption,
      takenAt: body.takenAt,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json(serializeMediaAsset(image), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Anlegen fehlgeschlagen";
    return NextResponse.json(
      { detail: message, code: "validation_error" },
      { status: 400 },
    );
  }
}
