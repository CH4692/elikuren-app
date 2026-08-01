import { prisma } from "@/lib/db";
import type { Role } from "@/lib/generated/prisma/client";

/** Bump sessionVersion so existing JWTs become invalid. */
export async function bumpSessionVersion(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}

export async function setUserActiveState(input: {
  userId: string;
  isActive: boolean;
  actorUserId?: string | null;
}) {
  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: {
      isActive: input.isActive,
      sessionVersion: { increment: 1 },
    },
  });

  return updated;
}

export async function changeUserRole(input: {
  userId: string;
  role: Role;
  actorUserId?: string | null;
}) {
  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: {
      role: input.role,
      sessionVersion: { increment: 1 },
    },
  });

  return updated;
}
