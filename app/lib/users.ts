import type { Prisma, Role } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

export { serializeUser } from "@/lib/users-serialize";

export type UserUpdateInput = {
  firstname?: string | null;
  lastname?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  postalCode?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  birthday?: string | null;
  memberSince?: string | null;
  role?: Role | null;
};

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function updateUser(userId: string, data: UserUpdateInput) {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const patch: Prisma.UserUpdateInput = {};
  if ("firstname" in data) patch.firstname = data.firstname;
  if ("lastname" in data) patch.lastname = data.lastname;
  if ("street" in data) patch.street = data.street;
  if ("houseNumber" in data) patch.houseNumber = data.houseNumber;
  if ("postalCode" in data) patch.postalCode = data.postalCode;
  if ("location" in data) patch.location = data.location;
  if ("phone" in data) patch.phone = data.phone;
  if ("email" in data) patch.email = data.email;
  if ("birthday" in data) {
    patch.birthday = data.birthday ? new Date(data.birthday) : null;
  }
  if ("memberSince" in data) {
    patch.memberSince = data.memberSince ? new Date(data.memberSince) : null;
  }
  if ("role" in data && data.role != null) {
    patch.role = data.role;
    if (data.role !== existing.role) {
      patch.sessionVersion = { increment: 1 };
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: patch,
  });
}

export async function deleteUser(userId: string) {
  const existing = await getUserById(userId);
  if (!existing) return false;
  await prisma.user.delete({ where: { id: userId } });
  return true;
}
