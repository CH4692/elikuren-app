import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import {
  createEvent,
  listEventsAdmin,
  serializeEventAdmin,
} from "@/lib/events";

export async function GET() {
  const gate = await requirePermission("EVENT_MANAGE");
  if (!gate.ok) return gate.response;

  const events = await listEventsAdmin();
  return NextResponse.json({
    items: events.map(serializeEventAdmin),
  });
}

export async function POST(request: Request) {
  const gate = await requirePermission("EVENT_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    title?: string;
    type?: string;
    starts_at?: string;
    ends_at?: string | null;
    location?: string | null;
    description?: string | null;
    rsvp_deadline?: string | null;
    piece_id?: string | null;
  };

  const title = String(body.title ?? "").trim();
  const startsAt = body.starts_at;
  if (!title || !startsAt) {
    return NextResponse.json(
      { detail: "Titel und Startzeit sind Pflicht", code: "validation_error" },
      { status: 400 },
    );
  }

  const event = await createEvent({
    title,
    type: body.type as Parameters<typeof createEvent>[0]["type"],
    startsAt,
    endsAt: body.ends_at,
    location: body.location,
    description: body.description,
    rsvpDeadline: body.rsvp_deadline,
    pieceId: body.piece_id,
  });

  await writeAuditLog({
    action: "event.created",
    entityType: "event",
    entityId: event.id,
    actorUserId: gate.user.id,
    metadata: { title },
  });

  return NextResponse.json(serializeEventAdmin(event), { status: 201 });
}
