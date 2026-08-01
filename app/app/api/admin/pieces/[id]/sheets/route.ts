import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import type {
  FileAccessScope,
  SheetType,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { AttachError, attachLibraryFile } from "@/lib/library-attach";
import { getPieceById } from "@/lib/pieces";

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
    isVisible?: boolean;
  };

  if (!body.storedFileId) {
    return NextResponse.json(
      { detail: "storedFileId fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const updated = await attachLibraryFile({
      storedFileId: body.storedFileId,
      kind: "sheet",
      pieceId,
      sheetType: body.sheetType,
      voiceGroup: body.voiceGroup,
      accessScope: body.accessScope,
      isVisible: body.isVisible,
    });
    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    if (error instanceof AttachError) {
      return NextResponse.json(
        { detail: error.message, code: error.code },
        { status: error.status },
      );
    }
    throw error;
  }
}
