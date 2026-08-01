import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { AttachError, attachLibraryFile } from "@/lib/library-attach";
import type {
  AudioType,
  FileAccessScope,
  SheetType,
  VoiceGroup,
} from "@/lib/generated/prisma/client";

export async function POST(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    storedFileId?: string;
    kind?: "sheet" | "audio";
    pieceId?: string | null;
    title?: string | null;
    composer?: string | null;
    sheetType?: SheetType;
    audioType?: AudioType;
    voiceGroup?: VoiceGroup | null;
    accessScope?: FileAccessScope;
    isVisible?: boolean;
  };

  if (!body.storedFileId || (body.kind !== "sheet" && body.kind !== "audio")) {
    return NextResponse.json(
      { detail: "storedFileId und kind (sheet|audio) sind Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const piece = await attachLibraryFile({
      storedFileId: body.storedFileId,
      kind: body.kind,
      pieceId: body.pieceId,
      title: body.title,
      composer: body.composer,
      sheetType: body.sheetType,
      audioType: body.audioType,
      voiceGroup: body.voiceGroup,
      accessScope: body.accessScope,
      isVisible: body.isVisible,
    });
    return NextResponse.json(piece, { status: 201 });
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
