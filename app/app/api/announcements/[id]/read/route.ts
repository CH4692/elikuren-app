import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import {
  getAnnouncementById,
  listPublishedForUser,
  markAnnouncementRead,
} from "@/lib/announcements";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const gate = await requirePermission("ANNOUNCEMENT_READ");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const published = await listPublishedForUser({
    id: gate.user.id,
    role: gate.user.role,
    voice: gate.user.voice,
  });
  const visible = published.find((a) => a.id === id);
  if (!visible) {
    const exists = await getAnnouncementById(id);
    if (!exists) {
      return NextResponse.json(
        { detail: "Mitteilung nicht gefunden", code: "http_404" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { detail: "Mitteilung nicht verfügbar", code: "http_403" },
      { status: 403 },
    );
  }

  const read = await markAnnouncementRead(id, gate.user.id);

  await writeAuditLog({
    action: "announcement.read",
    entityType: "announcement",
    entityId: id,
    actorUserId: gate.user.id,
  });

  return NextResponse.json({ read_at: read.readAt.toISOString() });
}
