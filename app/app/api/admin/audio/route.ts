import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const audios = await prisma.audioFile.findMany({
    where: q
      ? {
          OR: [
            { piece: { title: { contains: q, mode: "insensitive" } } },
            { piece: { composer: { contains: q, mode: "insensitive" } } },
            { storedFile: { originalName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      piece: { select: { id: true, title: true, composer: true } },
      storedFile: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          uploadStatus: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({
    items: audios.map((audio) => ({
      id: audio.id,
      piece_id: audio.pieceId,
      piece_title: audio.piece.title,
      piece_composer: audio.piece.composer,
      audio_type: audio.audioType,
      voice_group: audio.voiceGroup,
      access_scope: audio.accessScope,
      duration_seconds: audio.durationSeconds,
      published_at: audio.publishedAt?.toISOString() ?? null,
      stored_file: {
        id: audio.storedFile.id,
        original_name: audio.storedFile.originalName,
        mime_type: audio.storedFile.mimeType,
        size_bytes: audio.storedFile.sizeBytes,
        upload_status: audio.storedFile.uploadStatus,
      },
      created_at: audio.createdAt.toISOString(),
      updated_at: audio.updatedAt.toISOString(),
    })),
  });
}
