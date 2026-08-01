import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { listPublishedForUser, serializeAnnouncement } from "@/lib/announcements";

export async function GET() {
  const gate = await requirePermission("ANNOUNCEMENT_READ");
  if (!gate.ok) return gate.response;

  const items = await listPublishedForUser({
    id: gate.user.id,
    role: gate.user.role,
    voice: gate.user.voice,
  });

  return NextResponse.json({
    items: items.map((a) => serializeAnnouncement(a, gate.user.id)),
  });
}
