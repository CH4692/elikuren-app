import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import type { VoiceGroup } from "@/lib/generated/prisma/client";
import {
  getLibraryConcert,
  serializeConcert,
  serializeConcertItem,
} from "@/lib/concerts";

type Params = { params: Promise<{ id: string }> };

const ENSEMBLES = new Set([
  "SOPRANO",
  "ALTO",
  "TENOR",
  "BASS",
  "MUSICAL_TEAM",
  "EIGHT_TO_THE_BAR",
  "OTHER",
]);

export async function GET(request: Request, { params }: Params) {
  const gate = await requirePermission("MEMBER_CONTENT_READ");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const ensembleParam = new URL(request.url).searchParams.get("ensemble");
  const ensemble =
    ensembleParam && ENSEMBLES.has(ensembleParam)
      ? (ensembleParam as VoiceGroup)
      : null;

  const concert = await getLibraryConcert({
    idOrSlug: id,
    role: gate.user.role,
    ensemble,
  });
  if (!concert) {
    return NextResponse.json(
      { detail: "Nicht gefunden", code: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ...serializeConcert(concert),
    items: concert.items.map(serializeConcertItem),
    recordings: concert.recordings.map((audio) => ({
      id: audio.id,
      title: audio.title,
      audio_type: audio.audioType,
      voice_group: audio.voiceGroup,
      stored_file_id: audio.storedFileId,
      original_name: audio.storedFile.originalName,
    })),
  });
}
