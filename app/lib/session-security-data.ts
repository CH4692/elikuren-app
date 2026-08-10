import type { Role } from "@/lib/generated/prisma/client";

/** Prisma `data` payload that invalidates existing JWTs via sessionVersion bump. */
export function sessionBumpData() {
  return { sessionVersion: { increment: 1 as const } };
}

/** Prisma `data` payload for activate/deactivate — always bumps sessionVersion. */
export function setUserActiveData(isActive: boolean) {
  return {
    isActive,
    ...sessionBumpData(),
  };
}

/** Prisma `data` payload for role changes — always bumps sessionVersion. */
export function changeUserRoleData(role: Role) {
  return {
    role,
    ...sessionBumpData(),
  };
}
