import { prisma } from "@/lib/db";
import type { Role } from "@/lib/generated/prisma/client";
import {
  changeUserRoleData,
  sessionBumpData,
  setUserActiveData,
} from "@/lib/session-security-data";

export {
  changeUserRoleData,
  sessionBumpData,
  setUserActiveData,
} from "@/lib/session-security-data";

/** Bump sessionVersion so existing JWTs become invalid. */
export async function bumpSessionVersion(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: sessionBumpData(),
  });
}

export async function setUserActiveState(input: {
  userId: string;
  isActive: boolean;
  actorUserId?: string | null;
}) {
  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: setUserActiveData(input.isActive),
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
    data: changeUserRoleData(input.role),
  });

  return updated;
}
