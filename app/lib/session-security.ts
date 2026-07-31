import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
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

  await writeAuditLog({
    action: input.isActive ? "user.enabled" : "user.disabled",
    entityType: "user",
    entityId: input.userId,
    actorUserId: input.actorUserId,
    metadata: { email: updated.email },
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

  await writeAuditLog({
    action: "user.role_changed",
    entityType: "user",
    entityId: input.userId,
    actorUserId: input.actorUserId,
    metadata: { role: input.role, email: updated.email },
  });

  return updated;
}
