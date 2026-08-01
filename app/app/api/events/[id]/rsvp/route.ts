import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { getEventById, RSVP_STATUSES, upsertRsvp } from "@/lib/events";
import type { RsvpStatus } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const gate = await requirePermission("EVENT_RESPOND");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const event = await getEventById(id, gate.user.id);
  if (!event) {
    return NextResponse.json(
      { detail: "Termin nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    status?: RsvpStatus;
    note?: string | null;
  };

  if (!body.status || !RSVP_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { detail: "Ungültiger RSVP-Status", code: "validation_error" },
      { status: 400 },
    );
  }

  if (event.rsvpDeadline && new Date() > event.rsvpDeadline) {
    return NextResponse.json(
      { detail: "RSVP-Frist abgelaufen", code: "validation_error" },
      { status: 400 },
    );
  }

  const response = await upsertRsvp({
    eventId: id,
    userId: gate.user.id,
    status: body.status,
    note: body.note,
  });

  await writeAuditLog({
    action: "event.rsvp",
    entityType: "event",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: { status: body.status },
  });

  return NextResponse.json({
    status: response.status,
    note: response.note,
    updated_at: response.updatedAt.toISOString(),
  });
}
