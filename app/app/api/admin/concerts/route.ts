import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  createConcert,
  listConcertsAdmin,
  serializeConcert,
  type PerformanceWriteInput,
} from "@/lib/concerts";
import type { ConcertWebsiteStatus } from "@/lib/generated/prisma/client";

export async function GET(request: Request) {
  const gate = await requirePermission("CONCERT_MANAGE");
  if (!gate.ok) return gate.response;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const items = await listConcertsAdmin(q || undefined);
  return NextResponse.json({
    items: items.map((concert) => serializeConcert(concert)),
  });
}

export async function POST(request: Request) {
  const gate = await requirePermission("CONCERT_MANAGE");
  if (!gate.ok) return gate.response;

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
    performances?: PerformanceWriteInput[];
  };

  try {
    const concert = await createConcert({
      title: String(body.title ?? ""),
      slug: body.slug,
      date: body.date,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      subtitle: body.subtitle,
      description: body.description,
      location: body.location,
      address: body.address,
      programInfo: body.programInfo,
      leader: body.leader,
      admissionInfo: body.admissionInfo,
      footer: body.footer,
      extraInfo: body.extraInfo,
      ticketUrl: body.ticketUrl,
      websiteStatus: body.websiteStatus,
      heroImageId: body.heroImageId,
      isCurrent: body.isCurrent,
      notes: body.notes,
      performances: body.performances,
    });
    return NextResponse.json(serializeConcert(concert), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Anlegen fehlgeschlagen";
    return NextResponse.json(
      { detail: message, code: "validation_error" },
      { status: 400 },
    );
  }
}
