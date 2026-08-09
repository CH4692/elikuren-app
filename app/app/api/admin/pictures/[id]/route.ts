import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  deleteOrArchiveMediaAsset,
  serializeMediaAsset,
  updateMediaAsset,
} from "@/lib/gallery";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("MEDIA_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    altText?: string;
    isDecorative?: boolean;
    caption?: string | null;
    takenAt?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    isArchived?: boolean;
  };

  try {
    const updated = await updateMediaAsset(id, body);
    return NextResponse.json(serializeMediaAsset(updated));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Aktualisieren fehlgeschlagen";
    const status = message.includes("nicht gefunden") ? 404 : 400;
    return NextResponse.json(
      {
        detail: message,
        code: status === 404 ? "http_404" : "validation_error",
      },
      { status },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("MEDIA_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const result = await deleteOrArchiveMediaAsset(id);
    if (result.archived) {
      return NextResponse.json({
        archived: true,
        detail:
          "Bild wird noch referenziert und wurde archiviert statt gelöscht",
        item: serializeMediaAsset(result.image),
      });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Löschen fehlgeschlagen";
    const status = message.includes("nicht gefunden") ? 404 : 400;
    return NextResponse.json(
      {
        detail: message,
        code: status === 404 ? "http_404" : "validation_error",
      },
      { status },
    );
  }
}
