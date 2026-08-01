import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import {
  createAnnouncement,
  listAnnouncementsAdmin,
  serializeAnnouncement,
  type AnnouncementTargetInput,
} from "@/lib/announcements";
import type { Role, VoiceGroup } from "@/lib/generated/prisma/client";

export async function GET() {
  const gate = await requirePermission("ANNOUNCEMENT_MANAGE");
  if (!gate.ok) return gate.response;

  const items = await listAnnouncementsAdmin();
  return NextResponse.json({
    items: items.map((a) => serializeAnnouncement(a)),
  });
}

export async function POST(request: Request) {
  const gate = await requirePermission("ANNOUNCEMENT_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    title?: string;
    body?: string;
    is_important?: boolean;
    expires_at?: string | null;
    publish?: boolean;
    targets?: {
      audience: "ALL_MEMBERS" | "ROLE" | "VOICE_GROUP";
      role?: string | null;
      voice_group?: string | null;
    }[];
  };

  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();
  if (!title || !text) {
    return NextResponse.json(
      { detail: "Titel und Text sind Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  const item = await createAnnouncement({
    title,
    body: text,
    isImportant: body.is_important,
    expiresAt: body.expires_at,
    publish: body.publish,
    targets: body.targets?.map(
      (t): AnnouncementTargetInput => ({
        audience: t.audience,
        role: (t.role as Role | null) ?? null,
        voiceGroup: (t.voice_group as VoiceGroup | null) ?? null,
      }),
    ),
  });

  await writeAuditLog({
    action: body.publish ? "announcement.published" : "announcement.created",
    entityType: "announcement",
    entityId: item.id,
    actorUserId: gate.user.id,
    metadata: { title },
  });

  return NextResponse.json(serializeAnnouncement(item), { status: 201 });
}
