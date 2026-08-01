import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const sheets = await prisma.sheetFile.findMany({
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
    items: sheets.map((sheet) => ({
      id: sheet.id,
      piece_id: sheet.pieceId,
      piece_title: sheet.piece.title,
      piece_composer: sheet.piece.composer,
      sheet_type: sheet.sheetType,
      voice_group: sheet.voiceGroup,
      access_scope: sheet.accessScope,
      version: sheet.version,
      published_at: sheet.publishedAt?.toISOString() ?? null,
      stored_file: {
        id: sheet.storedFile.id,
        original_name: sheet.storedFile.originalName,
        mime_type: sheet.storedFile.mimeType,
        size_bytes: sheet.storedFile.sizeBytes,
        upload_status: sheet.storedFile.uploadStatus,
      },
      created_at: sheet.createdAt.toISOString(),
      updated_at: sheet.updatedAt.toISOString(),
    })),
  });
}
