import { NextResponse } from "next/server";

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
    isVisible?: boolean;
  };

  const updated = await prisma.audioFile.update({
    where: { id },
    data: {
      audioType: body.audioType,
      voiceGroup: body.voiceGroup === undefined ? undefined : body.voiceGroup,
      accessScope: body.accessScope,
      isVisible: body.isVisible,
    },
  });

  return NextResponse.json({
    id: updated.id,
    is_visible: updated.isVisible,
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

  return NextResponse.json({ deleted: true });
}
