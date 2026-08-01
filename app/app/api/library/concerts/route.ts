import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  getCurrentConcert,
  listLibraryConcerts,
  serializeConcert,
  serializeConcertItem,
} from "@/lib/concerts";

export async function GET(request: Request) {
  const gate = await requirePermission("MEMBER_CONTENT_READ");
  if (!gate.ok) return gate.response;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const currentOnly = url.searchParams.get("current") === "1";

  if (currentOnly) {
    const concert = await getCurrentConcert(gate.user.role);
    if (!concert) {
      return NextResponse.json({ concert: null });
    }
    return NextResponse.json({
      concert: {
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
      },
    });
  }

  const items = await listLibraryConcerts({
    role: gate.user.role,
    q: q || undefined,
  });
  return NextResponse.json({ items: items.map(serializeConcert) });
}
