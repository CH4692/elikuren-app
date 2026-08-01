import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import type { VoiceGroup } from "@/lib/generated/prisma/client";
import {
  deleteConcertItem,
  serializeConcertItem,
  upsertConcertItem,
} from "@/lib/concerts";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id: concertId } = await params;
  const body = (await request.json()) as {
    id?: string;
    title?: string;
    sortOrder?: number;
    ensemble?: VoiceGroup | null;
    sheetFileId?: string | null;
    audioFileId?: string | null;
    delete?: boolean;
  };

  if (body.delete && body.id) {
    try {
      await deleteConcertItem(body.id);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { detail: "Löschen fehlgeschlagen", code: "delete_failed" },
        { status: 400 },
      );
    }
  }

  try {
    const item = await upsertConcertItem(concertId, {
      id: body.id,
      title: String(body.title ?? ""),
      sortOrder: body.sortOrder,
      ensemble: body.ensemble,
      sheetFileId: body.sheetFileId,
      audioFileId: body.audioFileId,
    });
    return NextResponse.json(serializeConcertItem(item), {
      status: body.id ? 200 : 201,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Speichern fehlgeschlagen";
    return NextResponse.json(
      { detail: message, code: "validation_error" },
      { status: 400 },
    );
  }
}
