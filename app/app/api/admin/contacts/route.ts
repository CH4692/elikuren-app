import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { CONTACT_TYPES } from "@/lib/contact-types";
import { listContacts, serializeContact } from "@/lib/contacts";
import { prisma } from "@/lib/db";
import type { ContactType } from "@/lib/generated/prisma/client";

export async function GET(request: Request) {
  const gate = await requirePermission("CONTACT_MANAGE");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const typeParam = searchParams.get("type");
  const includeArchived = searchParams.get("archived") === "1";
  const type =
    typeParam && CONTACT_TYPES.includes(typeParam as ContactType)
      ? (typeParam as ContactType)
      : undefined;

  const items = await listContacts({ q, type, includeArchived });
  return NextResponse.json({ items: items.map(serializeContact) });
}

export async function POST(request: Request) {
  const gate = await requirePermission("CONTACT_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    type?: ContactType;
    firstname?: string | null;
    lastname?: string | null;
    email?: string | null;
    organization?: string | null;
    phone?: string | null;
    notes?: string | null;
    linked_user_id?: string | null;
  };

  const type = body.type ?? "OTHER";
  if (!CONTACT_TYPES.includes(type)) {
    return NextResponse.json(
      { detail: "Ungültiger Kontakttyp", code: "validation_error" },
      { status: 400 },
    );
  }

  if (body.linked_user_id) {
    const user = await prisma.user.findUnique({
      where: { id: body.linked_user_id },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { detail: "Verknüpfter Benutzer nicht gefunden", code: "http_404" },
        { status: 404 },
      );
    }
  }

  const created = await prisma.contact.create({
    data: {
      type,
      firstname: body.firstname?.trim() || null,
      lastname: body.lastname?.trim() || null,
      email: body.email?.trim().toLowerCase() || null,
      organization: body.organization?.trim() || null,
      phone: body.phone?.trim() || null,
      notes: body.notes?.trim() || null,
      linkedUserId: body.linked_user_id || null,
    },
    include: {
      linkedUser: {
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          phone: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  await writeAuditLog({
    action: "contact.created",
    entityType: "contact",
    entityId: created.id,
    actorUserId: gate.user.id,
    metadata: { type: created.type, email: created.email },
  });

  return NextResponse.json(serializeContact(created), { status: 201 });
}
