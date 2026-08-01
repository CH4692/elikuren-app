import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { listPublishedPiecesForUser, serializeLibraryPiece } from "@/lib/library";

export async function GET(request: Request) {
  const gate = await requirePermission("MEMBER_CONTENT_READ");
  if (!gate.ok) return gate.response;

  const q = new URL(request.url).searchParams.get("q") ?? undefined;
  const pieces = await listPublishedPiecesForUser({
    role: gate.user.role,
    voice: gate.user.voice,
    q,
  });

  return NextResponse.json({
    items: pieces.map((piece) =>
      serializeLibraryPiece(piece, gate.user.voice),
    ),
    my_voice: gate.user.voice,
  });
}
