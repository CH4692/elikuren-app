import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import type { FileAccessScope, SheetType, VoiceGroup } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await prisma.sheetFile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { detail: "Notendatei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    sheetType?: SheetType;
    voiceGroup?: VoiceGroup | null;
    accessScope?: FileAccessScope;
    version?: string;
    changelog?: string | null;
    publish?: boolean;
    unpublish?: boolean;
  };

  let publishedAt = existing.publishedAt;
  if (body.publish) publishedAt = new Date();
  if (body.unpublish) publishedAt = null;

  const updated = await prisma.sheetFile.update({
    where: { id },
    data: {
      sheetType: body.sheetType,
      voiceGroup: body.voiceGroup === undefined ? undefined : body.voiceGroup,
      accessScope: body.accessScope,
      version: body.version?.trim() || undefined,
      changelog:
        body.changelog !== undefined
          ? body.changelog?.trim() || null
          : undefined,
      publishedAt,
    },
  });

  await writeAuditLog({
    action: "sheet.updated",
    entityType: "sheet_file",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: {
      published: Boolean(updated.publishedAt),
      accessScope: updated.accessScope,
    },
  });

  return NextResponse.json({
    id: updated.id,
    published_at: updated.publishedAt?.toISOString() ?? null,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await prisma.sheetFile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { detail: "Notendatei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.sheetFile.delete({ where: { id } }),
    prisma.storedFile.update({
      where: { id: existing.storedFileId },
      data: { deletedAt: new Date(), uploadStatus: "DELETED" },
    }),
  ]);

  await writeAuditLog({
    action: "sheet.deleted",
    entityType: "sheet_file",
    entityId: id,
    actorUserId: gate.user.id,
  });

  return NextResponse.json({ deleted: true });
}
