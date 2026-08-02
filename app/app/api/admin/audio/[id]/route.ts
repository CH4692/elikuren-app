import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import type {
  AudioType,
  FileAccessScope,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { serializeAudio } from "@/lib/audio-library";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("PIECE_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await prisma.audioFile.findUnique({
    where: { id },
    include: {
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
  });
  if (!existing) {
    return NextResponse.json(
      { detail: "Audiodatei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    title?: string;
    composer?: string | null;
    voiceGroup?: VoiceGroup | null;
    audioType?: AudioType;
    accessScope?: FileAccessScope;
  };

  const title =
    body.title !== undefined ? String(body.title).trim() : existing.title;
  if (!title) {
    return NextResponse.json(
      { detail: "Titel ist Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  const updated = await prisma.audioFile.update({
    where: { id },
    data: {
      title,
      composer:
        body.composer !== undefined
          ? String(body.composer ?? "").trim()
          : undefined,
      voiceGroup: body.voiceGroup === undefined ? undefined : body.voiceGroup,
      audioType: body.audioType,
      accessScope: body.accessScope,
    },
    include: {
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
  });

  return NextResponse.json(serializeAudio(updated));
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
