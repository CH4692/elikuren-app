import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  deleteConcert,
  getConcertAdmin,
  serializeConcert,
  updateConcert,
} from "@/lib/concerts";
import type { ConcertWebsiteStatus } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requirePermission("CONCERT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const concert = await getConcertAdmin(id);
  if (!concert) {
    return NextResponse.json(
      { detail: "Nicht gefunden", code: "not_found" },
      { status: 404 },
    );
  }
  return NextResponse.json(serializeConcert(concert));
}

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("CONCERT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    slug?: string | null;
    date?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    subtitle?: string | null;
    description?: string | null;
    location?: string | null;
    address?: string | null;
    programInfo?: string | null;
    leader?: string | null;
    admissionInfo?: string | null;
    footer?: string | null;
    extraInfo?: string | null;
    ticketUrl?: string | null;
    websiteStatus?: ConcertWebsiteStatus;
    heroImageId?: string | null;
    isCurrent?: boolean;
    notes?: string | null;
  };

  try {
    const concert = await updateConcert(id, body);
    return NextResponse.json(serializeConcert(concert));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Aktualisieren fehlgeschlagen";
    const status = message.includes("nicht gefunden") ? 404 : 400;
    return NextResponse.json(
      { detail: message, code: status === 404 ? "not_found" : "validation_error" },
      { status },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("CONCERT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    await deleteConcert(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { detail: "Löschen fehlgeschlagen", code: "delete_failed" },
      { status: 400 },
    );
  }
}
