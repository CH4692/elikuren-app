import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import type {
  AudioType,
  FileAccessScope,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import {
  createAudio,
  listAudioAdmin,
  serializeAudio,
} from "@/lib/audio-library";

export async function GET(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const items = await listAudioAdmin(q || undefined);
  return NextResponse.json({ items: items.map(serializeAudio) });
}

export async function POST(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    storedFileId?: string;
    title?: string;
    composer?: string | null;
    voiceGroup?: VoiceGroup | null;
    audioType?: AudioType;
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
    const audio = await createAudio({
      storedFileId: body.storedFileId,
      title: String(body.title ?? ""),
      composer: body.composer,
      voiceGroup: body.voiceGroup,
      audioType: body.audioType,
      accessScope: body.accessScope,
      isVisible: body.isVisible,
    });
    return NextResponse.json(serializeAudio(audio), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Anlegen fehlgeschlagen";
    return NextResponse.json(
      { detail: message, code: "validation_error" },
      { status: 400 },
    );
  }
}
