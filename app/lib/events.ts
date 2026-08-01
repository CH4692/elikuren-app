import type { Event, EventResponse, EventType, Prisma, RsvpStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

type EventWithResponses = Event & {
  responses?: (EventResponse & {
    user?: { id: string; firstname: string | null; lastname: string | null; voice: string | null };
  })[];
  piece?: { id: string; title: string } | null;
  _count?: { responses: number };
};

export function serializeEvent(
  event: EventWithResponses,
  userId?: string,
) {
  const myResponse = userId
    ? event.responses?.find((r) => r.userId === userId)
    : undefined;

  return {
    id: event.id,
    title: event.title,
    type: event.type,
    starts_at: event.startsAt.toISOString(),
    ends_at: event.endsAt?.toISOString() ?? null,
    location: event.location,
    description: event.description,
    rsvp_deadline: event.rsvpDeadline?.toISOString() ?? null,
    piece_id: event.pieceId,
    piece: event.piece
      ? { id: event.piece.id, title: event.piece.title }
      : null,
    response_count: event._count?.responses ?? event.responses?.length ?? 0,
    my_response: myResponse
      ? {
          status: myResponse.status,
          note: myResponse.note,
          updated_at: myResponse.updatedAt.toISOString(),
        }
      : null,
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
  };
}

export function serializeEventAdmin(event: EventWithResponses) {
  const base = serializeEvent(event);
  const responses = event.responses ?? [];

  const byVoice: Record<string, { yes: number; no: number; maybe: number }> = {};
  for (const r of responses) {
    const voice = r.user?.voice ?? "Unbekannt";
    if (!byVoice[voice]) byVoice[voice] = { yes: 0, no: 0, maybe: 0 };
    if (r.status === "YES") byVoice[voice].yes++;
    else if (r.status === "NO") byVoice[voice].no++;
    else byVoice[voice].maybe++;
  }

  return {
    ...base,
    rsvp_summary: byVoice,
    responses: responses.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note,
      user: r.user
        ? {
            id: r.user.id,
            firstname: r.user.firstname,
            lastname: r.user.lastname,
            voice: r.user.voice,
          }
        : null,
      updated_at: r.updatedAt.toISOString(),
    })),
  };
}

export async function listEventsForMember(userId: string, from?: Date) {
  const where: Prisma.EventWhereInput = {};
  if (from) {
    where.startsAt = { gte: from };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
    include: {
      piece: { select: { id: true, title: true } },
      responses: { where: { userId } },
      _count: { select: { responses: true } },
    },
  });

  return events;
}

export async function listEventsAdmin() {
  return prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      piece: { select: { id: true, title: true } },
      responses: {
        include: {
          user: {
            select: { id: true, firstname: true, lastname: true, voice: true },
          },
        },
      },
      _count: { select: { responses: true } },
    },
  });
}

export async function getEventById(id: string, userId?: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      piece: { select: { id: true, title: true } },
      responses: {
        ...(userId ? { where: { userId } } : {}),
        include: userId
          ? undefined
          : {
              user: {
                select: { id: true, firstname: true, lastname: true, voice: true },
              },
            },
      },
      _count: { select: { responses: true } },
    },
  });
}

export type EventCreateInput = {
  title: string;
  type?: EventType;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  description?: string | null;
  rsvpDeadline?: string | null;
  pieceId?: string | null;
};

export type EventPatchBody = Partial<EventCreateInput>;

export async function createEvent(data: EventCreateInput) {
  return prisma.event.create({
    data: {
      title: data.title,
      type: data.type ?? "REHEARSAL",
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      location: data.location?.trim() || null,
      description: data.description?.trim() || null,
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : null,
      pieceId: data.pieceId || null,
    },
    include: {
      piece: { select: { id: true, title: true } },
      responses: true,
      _count: { select: { responses: true } },
    },
  });
}

export async function updateEvent(id: string, data: EventPatchBody) {
  const patch: Prisma.EventUpdateInput = {};
  if ("title" in data && data.title != null) patch.title = data.title.trim();
  if ("type" in data && data.type != null) patch.type = data.type;
  if ("startsAt" in data && data.startsAt != null)
    patch.startsAt = new Date(data.startsAt);
  if ("endsAt" in data) patch.endsAt = data.endsAt ? new Date(data.endsAt) : null;
  if ("location" in data) patch.location = data.location?.trim() || null;
  if ("description" in data) patch.description = data.description?.trim() || null;
  if ("rsvpDeadline" in data)
    patch.rsvpDeadline = data.rsvpDeadline ? new Date(data.rsvpDeadline) : null;
  if ("pieceId" in data) {
    const pieceId = data.pieceId;
    patch.piece = pieceId ? { connect: { id: pieceId } } : { disconnect: true };
  }

  return prisma.event.update({
    where: { id },
    data: patch,
    include: {
      piece: { select: { id: true, title: true } },
      responses: {
        include: {
          user: {
            select: { id: true, firstname: true, lastname: true, voice: true },
          },
        },
      },
      _count: { select: { responses: true } },
    },
  });
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
}

export async function upsertRsvp(input: {
  eventId: string;
  userId: string;
  status: RsvpStatus;
  note?: string | null;
}) {
  return prisma.eventResponse.upsert({
    where: {
      eventId_userId: { eventId: input.eventId, userId: input.userId },
    },
    create: {
      eventId: input.eventId,
      userId: input.userId,
      status: input.status,
      note: input.note?.trim() || null,
    },
    update: {
      status: input.status,
      note: input.note?.trim() || null,
    },
  });
}

export const EVENT_TYPES: EventType[] = [
  "REHEARSAL",
  "SPECIAL_REHEARSAL",
  "GENERAL_REHEARSAL",
  "CONCERT",
  "SERVICE",
  "PERFORMANCE",
  "OTHER",
];

export const RSVP_STATUSES: RsvpStatus[] = ["YES", "NO", "MAYBE"];
