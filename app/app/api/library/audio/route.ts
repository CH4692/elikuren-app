import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import type { AudioType } from "@/lib/generated/prisma/client";
import { listLibraryAudio } from "@/lib/library";

const AUDIO_TYPES = new Set([
  "FULL_RECORDING",
  "SOPRANO",
  "ALTO",
  "TENOR",
  "BASS",
  "PIANO",
  "REHEARSAL",
  "PRONUNCIATION",
  "CONCERT_RECORDING",
  "OTHER",
]);

export async function GET(request: Request) {
  const gate = await requirePermission("MEMBER_CONTENT_READ");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const myVoiceOnly = searchParams.get("myVoice") === "1";
  const typeParam = searchParams.get("type");
  const audioType =
    typeParam && AUDIO_TYPES.has(typeParam)
      ? (typeParam as AudioType)
      : null;

  const items = await listLibraryAudio({
    role: gate.user.role,
    voice: gate.user.voice,
    q,
    myVoiceOnly,
    audioType,
  });

  return NextResponse.json({
    items,
    my_voice: gate.user.voice,
  });
}
