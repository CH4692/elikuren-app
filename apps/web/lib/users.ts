import type { Prisma, Role, User } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

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

function tsToDate(value: number | null | undefined): Date | null {
  if (value == null) return null;
  const ms = value > 10_000_000_000 ? value : value * 1000;
  return new Date(ms);
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    street: user.street,
    house_number: user.houseNumber,
    postal_code: user.postalCode,
    location: user.location,
    phone: user.phone,
    email: user.email,
    birthday: user.birthday?.toISOString().slice(0, 10) ?? null,
    created_at: user.createdAt.toISOString(),
    last_signed_in: user.lastSignedIn?.toISOString() ?? null,
    updated_at: user.updatedAt?.toISOString() ?? null,
    member_since: user.memberSince?.toISOString().slice(0, 10) ?? null,
    role: user.role,
  };
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { id: clerkId } });
}

export async function getOrCreateUserFromClerk(authUser: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  primaryPhoneNumber?: { phoneNumber: string } | null;
  createdAt?: Date | null;
}) {
  const existing = await getUserByClerkId(authUser.id);
  if (existing) return existing;

  const now = new Date();
  return prisma.user.create({
    data: {
      id: authUser.id,
      firstname: authUser.firstName ?? null,
      lastname: authUser.lastName ?? null,
      email: authUser.primaryEmailAddress?.emailAddress ?? null,
      phone: authUser.primaryPhoneNumber?.phoneNumber ?? null,
      createdAt: authUser.createdAt ?? now,
      updatedAt: now,
    },
  });
}

export async function updateUser(clerkId: string, data: UserUpdateInput) {
  const existing = await getUserByClerkId(clerkId);
  if (!existing) return null;

  const patch: Prisma.UserUpdateInput = { updatedAt: new Date() };
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
  if ("role" in data && data.role != null) patch.role = data.role;

  return prisma.user.update({
    where: { id: clerkId },
    data: patch,
  });
}

export async function deleteUser(clerkId: string) {
  const existing = await getUserByClerkId(clerkId);
  if (!existing) return false;
  await prisma.user.delete({ where: { id: clerkId } });
  return true;
}

export async function upsertUserFromClerkWebhook(data: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  created_at?: number;
  updated_at?: number;
  primary_email_address_id?: string | null;
  primary_phone_number_id?: string | null;
  email_addresses?: Array<{ id: string; email_address: string }>;
  phone_numbers?: Array<{ id: string; phone_number: string }>;
}) {
  const createdAt = tsToDate(data.created_at) ?? new Date();
  const updatedAt = tsToDate(data.updated_at) ?? new Date();

  let email: string | null = null;
  const emails = data.email_addresses ?? [];
  if (emails.length > 0) {
    const primary =
      emails.find((item) => item.id === data.primary_email_address_id) ??
      emails[0];
    email = primary.email_address;
  }

  let phone: string | null = null;
  const phones = data.phone_numbers ?? [];
  if (phones.length > 0) {
    const primary =
      phones.find((item) => item.id === data.primary_phone_number_id) ??
      phones[0];
    phone = primary.phone_number;
  }

  return prisma.user.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      firstname: data.first_name ?? null,
      lastname: data.last_name ?? null,
      email,
      phone,
      createdAt,
      updatedAt,
    },
    update: {
      firstname: data.first_name ?? null,
      lastname: data.last_name ?? null,
      ...(email != null ? { email } : {}),
      ...(phone != null ? { phone } : {}),
      updatedAt,
    },
  });
}
