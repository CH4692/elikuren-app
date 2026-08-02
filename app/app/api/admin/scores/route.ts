import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import type { FileAccessScope, VoiceGroup } from "@/lib/generated/prisma/client";
import { createScore, listScoresAdmin, serializeScore } from "@/lib/scores";

export async function GET(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const sheets = await listScoresAdmin(q || undefined);
  return NextResponse.json({ items: sheets.map(serializeScore) });
}

export async function POST(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    storedFileId?: string;
    title?: string;
    composer?: string | null;
    voiceGroup?: VoiceGroup | null;
    accessScope?: FileAccessScope;
    concertId?: string;
  };

  if (!body.storedFileId) {
    return NextResponse.json(
      { detail: "storedFileId fehlt", code: "validation_error" },
      { status: 400 },
    );
  }
  if (!body.concertId) {
    return NextResponse.json(
      { detail: "Konzert ist Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const sheet = await createScore({
      storedFileId: body.storedFileId,
      title: String(body.title ?? ""),
      composer: body.composer,
      voiceGroup: body.voiceGroup,
      accessScope: body.accessScope,
      concertId: body.concertId,
    });
    return NextResponse.json(serializeScore(sheet), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Anlegen fehlgeschlagen";
    return NextResponse.json(
      { detail: message, code: "validation_error" },
      { status: 400 },
    );
  }
}
