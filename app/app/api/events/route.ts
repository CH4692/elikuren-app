import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { listEventsForMember, serializeEvent } from "@/lib/events";

export async function GET(request: Request) {
  const gate = await requirePermission("EVENT_READ");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const from = fromParam ? new Date(fromParam) : undefined;

  const events = await listEventsForMember(gate.user.id, from);
  return NextResponse.json({
    items: events.map((e) => serializeEvent(e, gate.user.id)),
  });
}
