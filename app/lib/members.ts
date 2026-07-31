import type { Prisma, Role, User } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

export function serializeMember(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
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

export async function updateMemberVoice(userId: string, voice: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { voice },
  });
}

export const ROLES: Role[] = [
  "mitglied",
  "vorstand",
  "kassenwart",
  "kassenpruefer",
];
