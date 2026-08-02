import type { Prisma, Role, User } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

export function serializeMember(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    phone: user.phone,
    street: user.street,
    house_number: user.houseNumber,
    postal_code: user.postalCode,
    location: user.location,
    voice: user.voice,
    role: user.role,
    is_active: user.isActive,
    member_since: user.memberSince?.toISOString().slice(0, 10) ?? null,
    last_signed_in: user.lastSignedIn?.toISOString() ?? null,
    created_at: user.createdAt.toISOString(),
  };
}

export async function listMembers(q?: string) {
  const where: Prisma.UserWhereInput = {};
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { email: { contains: term, mode: "insensitive" } },
      { firstname: { contains: term, mode: "insensitive" } },
      { lastname: { contains: term, mode: "insensitive" } },
      { voice: { contains: term, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    orderBy: [{ lastname: "asc" }, { firstname: "asc" }],
  });
}

export async function getMemberById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function deleteMember(userId: string): Promise<
  | { ok: true }
  | { ok: false; code: "not_found" | "last_vorstand"; detail: string }
> {
  const member = await getMemberById(userId);
  if (!member) {
    return { ok: false, code: "not_found", detail: "Mitglied nicht gefunden" };
  }

  if (member.role === "vorstand") {
    const otherVorstand = await prisma.user.count({
      where: {
        id: { not: userId },
        role: "vorstand",
        isActive: true,
      },
    });
    if (otherVorstand === 0) {
      return {
        ok: false,
        code: "last_vorstand",
        detail: "Der letzte aktive Vorstand kann nicht gelöscht werden",
      };
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

export async function updateMemberVoice(userId: string, voice: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { voice },
  });
}

export type MemberProfileInput = {
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  postalCode?: string | null;
  location?: string | null;
};

export async function updateMemberProfile(
  userId: string,
  data: MemberProfileInput,
) {
  const patch: Prisma.UserUpdateInput = {};
  if ("firstname" in data) patch.firstname = data.firstname?.trim() || null;
  if ("lastname" in data) patch.lastname = data.lastname?.trim() || null;
  if ("phone" in data) patch.phone = data.phone?.trim() || null;
  if ("street" in data) patch.street = data.street?.trim() || null;
  if ("houseNumber" in data)
    patch.houseNumber = data.houseNumber?.trim() || null;
  if ("postalCode" in data) patch.postalCode = data.postalCode?.trim() || null;
  if ("location" in data) patch.location = data.location?.trim() || null;

  if (Object.keys(patch).length === 0) return getMemberById(userId);

  return prisma.user.update({
    where: { id: userId },
    data: patch,
  });
}

export const ROLES: Role[] = [
  "mitglied",
  "vorstand",
  "kassenwart",
  "kassenpruefer",
];
