import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import type {
  AudioType,
  FileAccessScope,
  VoiceGroup,
} from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await prisma.audioFile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { detail: "Audiodatei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    audioType?: AudioType;
    voiceGroup?: VoiceGroup | null;
    accessScope?: FileAccessScope;
    publish?: boolean;
    unpublish?: boolean;
  };

  let publishedAt = existing.publishedAt;
  if (body.publish) publishedAt = new Date();
  if (body.unpublish) publishedAt = null;

  const updated = await prisma.audioFile.update({
    where: { id },
    data: {
      audioType: body.audioType,
      voiceGroup: body.voiceGroup === undefined ? undefined : body.voiceGroup,
      accessScope: body.accessScope,
      publishedAt,
    },
  });

  await writeAuditLog({
    action: "audio.updated",
    entityType: "audio_file",
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
  const existing = await prisma.audioFile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { detail: "Audiodatei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.audioFile.delete({ where: { id } }),
    prisma.storedFile.update({
      where: { id: existing.storedFileId },
      data: { deletedAt: new Date(), uploadStatus: "DELETED" },
    }),
  ]);

  await writeAuditLog({
    action: "audio.deleted",
    entityType: "audio_file",
    entityId: id,
    actorUserId: gate.user.id,
  });

  return NextResponse.json({ deleted: true });
}
