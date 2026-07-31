import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import {
  deleteAnnouncement,
  getAnnouncementById,
  serializeAnnouncement,
  updateAnnouncement,
  type AnnouncementTargetInput,
} from "@/lib/announcements";
import type { Role, VoiceGroup } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("ANNOUNCEMENT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getAnnouncementById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Mitteilung nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    title?: string;
    body?: string;
    is_important?: boolean;
    expires_at?: string | null;
    publish?: boolean;
    unpublish?: boolean;
    targets?: {
      audience: "ALL_MEMBERS" | "ROLE" | "VOICE_GROUP";
      role?: string | null;
      voice_group?: string | null;
    }[];
  };

  const item = await updateAnnouncement(id, {
    title: body.title,
    body: body.body,
    isImportant: body.is_important,
    expiresAt: body.expires_at,
    publish: body.publish,
    unpublish: body.unpublish,
    targets: body.targets?.map(
      (t): AnnouncementTargetInput => ({
        audience: t.audience,
        role: (t.role as Role | null) ?? null,
        voiceGroup: (t.voice_group as VoiceGroup | null) ?? null,
      }),
    ),
  });

  await writeAuditLog({
    action: body.publish
      ? "announcement.published"
      : body.unpublish
        ? "announcement.unpublished"
        : "announcement.updated",
    entityType: "announcement",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: { title: item.title },
  });

  return NextResponse.json(serializeAnnouncement(item));
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("ANNOUNCEMENT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getAnnouncementById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Mitteilung nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await deleteAnnouncement(id);

  await writeAuditLog({
    action: "announcement.deleted",
    entityType: "announcement",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ deleted: true });
}
