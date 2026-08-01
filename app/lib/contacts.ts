import type { Contact, ContactType, Prisma, User } from "@/lib/generated/prisma/client";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
} from "@/lib/contact-types";
import { prisma } from "@/lib/db";

export { CONTACT_TYPE_LABELS, CONTACT_TYPES };

type ContactWithUser = Contact & {
  linkedUser: Pick<
    User,
    "id" | "email" | "firstname" | "lastname" | "phone" | "role" | "isActive"
  > | null;
};

export function serializeContact(contact: ContactWithUser) {
  const linked = contact.linkedUser;
  const preferLinked =
    linked &&
    (contact.type === "CHOIR_MEMBER" || contact.type === "FORMER_MEMBER");

  return {
    id: contact.id,
    type: contact.type,
    firstname: preferLinked
      ? (linked.firstname ?? contact.firstname)
      : contact.firstname,
    lastname: preferLinked
      ? (linked.lastname ?? contact.lastname)
      : contact.lastname,
    email: preferLinked ? (linked.email ?? contact.email) : contact.email,
    organization: contact.organization,
    phone: preferLinked ? (linked.phone ?? contact.phone) : contact.phone,
    notes: contact.notes,
    linked_user_id: contact.linkedUserId,
    linked_user: linked
      ? {
          id: linked.id,
          email: linked.email,
          firstname: linked.firstname,
          lastname: linked.lastname,
          phone: linked.phone,
          role: linked.role,
          is_active: linked.isActive,
        }
      : null,
    archived_at: contact.archivedAt?.toISOString() ?? null,
    created_at: contact.createdAt.toISOString(),
    updated_at: contact.updatedAt.toISOString(),
  };
}

const linkedUserSelect = {
  id: true,
  email: true,
  firstname: true,
  lastname: true,
  phone: true,
  role: true,
  isActive: true,
} as const;

export async function listContacts(opts?: {
  q?: string;
  type?: ContactType;
  includeArchived?: boolean;
}) {
  const where: Prisma.ContactWhereInput = {};
  if (!opts?.includeArchived) {
    where.archivedAt = null;
  }
  if (opts?.type) {
    where.type = opts.type;
  }
  if (opts?.q?.trim()) {
    const term = opts.q.trim();
    where.OR = [
      { email: { contains: term, mode: "insensitive" } },
      { firstname: { contains: term, mode: "insensitive" } },
      { lastname: { contains: term, mode: "insensitive" } },
      { organization: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      {
        linkedUser: {
          OR: [
            { email: { contains: term, mode: "insensitive" } },
            { firstname: { contains: term, mode: "insensitive" } },
            { lastname: { contains: term, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return prisma.contact.findMany({
    where,
    include: { linkedUser: { select: linkedUserSelect } },
    orderBy: [{ lastname: "asc" }, { firstname: "asc" }, { organization: "asc" }],
  });
}

export async function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: { linkedUser: { select: linkedUserSelect } },
  });
}
