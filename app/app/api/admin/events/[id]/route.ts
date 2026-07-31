import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import {
  deleteEvent,
  getEventById,
  serializeEventAdmin,
  updateEvent,
} from "@/lib/events";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("EVENT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getEventById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Termin nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

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

  const event = await updateEvent(id, {
    title: body.title,
    type: body.type as Parameters<typeof updateEvent>[1]["type"],
    startsAt: body.starts_at,
    endsAt: body.ends_at,
    location: body.location,
    description: body.description,
    rsvpDeadline: body.rsvp_deadline,
    pieceId: body.piece_id,
  });

  await writeAuditLog({
    action: "event.updated",
    entityType: "event",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: { title: event.title },
  });

  return NextResponse.json(serializeEventAdmin(event));
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("EVENT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getEventById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Termin nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  await deleteEvent(id);

  await writeAuditLog({
    action: "event.deleted",
    entityType: "event",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ deleted: true });
}
