import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import { CONTACT_TYPES } from "@/lib/contact-types";
import { getContactById, serializeContact } from "@/lib/contacts";
import { prisma } from "@/lib/db";
import type { ContactType } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requirePermission("CONTACT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const contact = await getContactById(id);
  if (!contact) {
    return NextResponse.json(
      { detail: "Kontakt nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }
  return NextResponse.json(serializeContact(contact));
}

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("CONTACT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getContactById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Kontakt nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    type?: ContactType;
    firstname?: string | null;
    lastname?: string | null;
    email?: string | null;
    organization?: string | null;
    phone?: string | null;
    notes?: string | null;
    linked_user_id?: string | null;
    archived?: boolean;
  };

  if (body.type && !CONTACT_TYPES.includes(body.type)) {
    return NextResponse.json(
      { detail: "Ungültiger Kontakttyp", code: "validation_error" },
      { status: 400 },
    );
  }

  if ("linked_user_id" in body && body.linked_user_id) {
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

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      ...(body.type ? { type: body.type } : {}),
      ...("firstname" in body
        ? { firstname: body.firstname?.trim() || null }
        : {}),
      ...("lastname" in body
        ? { lastname: body.lastname?.trim() || null }
        : {}),
      ...("email" in body
        ? { email: body.email?.trim().toLowerCase() || null }
        : {}),
      ...("organization" in body
        ? { organization: body.organization?.trim() || null }
        : {}),
      ...("phone" in body ? { phone: body.phone?.trim() || null } : {}),
      ...("notes" in body ? { notes: body.notes?.trim() || null } : {}),
      ...("linked_user_id" in body
        ? { linkedUserId: body.linked_user_id || null }
        : {}),
      ...("archived" in body
        ? {
            archivedAt: body.archived
              ? (existing.archivedAt ?? new Date())
              : null,
          }
        : {}),
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
    action: body.archived ? "contact.archived" : "contact.updated",
    entityType: "contact",
    entityId: id,
    actorUserId: gate.user.id,
    metadata: { type: updated.type },
  });

  return NextResponse.json(serializeContact(updated));
}

export async function DELETE(_request: Request, { params }: Params) {
  const gate = await requirePermission("CONTACT_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const existing = await getContactById(id);
  if (!existing) {
    return NextResponse.json(
      { detail: "Kontakt nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  if (existing.linkedUserId) {
    const archived = await prisma.contact.update({
      where: { id },
      data: { archivedAt: existing.archivedAt ?? new Date() },
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
      action: "contact.archived",
      entityType: "contact",
      entityId: id,
      actorUserId: gate.user.id,
      metadata: { reason: "linked_user_soft_delete" },
    });
    return NextResponse.json({
      archived: true,
      item: serializeContact(archived),
    });
  }

  await prisma.contact.delete({ where: { id } });
  await writeAuditLog({
    action: "contact.deleted",
    entityType: "contact",
    entityId: id,
    actorUserId: gate.user.id,
  });
  return NextResponse.json({ deleted: true });
}
