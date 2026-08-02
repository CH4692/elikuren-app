import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { listLibraryScores } from "@/lib/library";

export async function GET(request: Request) {
  const gate = await requirePermission("MEMBER_CONTENT_READ");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const voiceGroup = searchParams.get("voiceGroup")?.trim() || undefined;

  const items = await listLibraryScores({
    role: gate.user.role,
    voice: gate.user.voice,
    q,
    voiceGroup,
  });

  return NextResponse.json({
    items,
    my_voice: gate.user.voice,
  });
}
