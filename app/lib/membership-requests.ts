import type { MembershipRequestStatus } from "@/lib/generated/prisma/client";

import { normalizeEmail } from "@/lib/permissions";
import { prisma } from "@/lib/db";

const SUCCESS_COPY =
  "Falls dein Zugang bereits freigegeben wurde, erhältst du in Kürze einen Anmeldelink. Andernfalls wirst du informiert, sobald ein Administrator deinen Zugang freigegeben hat.";

export function pendingApprovalMessage() {
  return SUCCESS_COPY;
}

export async function createMembershipRequest(input: {
  email: string;
  firstname?: string;
  lastname?: string;
  message?: string;
  voice?: string;
}): Promise<{ ok: true; created: boolean }> {
  const email = normalizeEmail(input.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: true, created: false };
  }

  const pending = await prisma.membershipRequest.findFirst({
    where: { email, status: "pending" },
  });
  if (pending) {
    return { ok: true, created: false };
  }

  await prisma.membershipRequest.create({
    data: {
      email,
      firstname: input.firstname?.trim() || null,
      lastname: input.lastname?.trim() || null,
      message: input.message?.trim() || null,
      voice: input.voice?.trim() || null,
    },
  });

  return { ok: true, created: true };
}

export async function listMembershipRequests(status?: MembershipRequestStatus) {
  return prisma.membershipRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      approvedBy: {
        select: { id: true, firstname: true, lastname: true, email: true },
      },
      rejectedBy: {
        select: { id: true, firstname: true, lastname: true, email: true },
      },
    },
  });
}

export async function reviewMembershipRequest(input: {
  id: string;
  status: "approved" | "rejected";
  reviewerId: string;
  voice?: string | null;
  adminNote?: string | null;
}) {
  const request = await prisma.membershipRequest.findUnique({
    where: { id: input.id },
  });
  if (!request) return null;
  if (request.status !== "pending") {
    throw new Error("NOT_PENDING");
  }

  const now = new Date();
  const voice =
    input.voice !== undefined
      ? input.voice?.trim() || null
      : request.voice;
  const adminNote =
    input.adminNote !== undefined
      ? input.adminNote?.trim() || null
      : request.adminNote;

  if (input.status === "rejected") {
    const updated = await prisma.membershipRequest.update({
      where: { id: input.id },
      data: {
        status: "rejected",
        voice,
        adminNote,
        rejectedAt: now,
        rejectedById: input.reviewerId,
      },
    });

    return updated;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email: request.email },
    });

    if (existingUser) {
      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          firstname: request.firstname ?? existingUser.firstname,
          lastname: request.lastname ?? existingUser.lastname,
          name:
            [request.firstname, request.lastname].filter(Boolean).join(" ") ||
            existingUser.name,
          voice,
          isActive: true,
          memberSince: existingUser.memberSince ?? now,
          role:
            existingUser.role === "vorstand" ? "vorstand" : "mitglied",
        },
      });
    } else {
      await tx.user.create({
        data: {
          email: request.email,
          firstname: request.firstname,
          lastname: request.lastname,
          name:
            [request.firstname, request.lastname].filter(Boolean).join(" ") ||
            null,
          voice,
          isActive: true,
          role: "mitglied",
          memberSince: now,
        },
      });
    }

    return tx.membershipRequest.update({
      where: { id: input.id },
      data: {
        status: "approved",
        voice,
        adminNote,
        approvedAt: now,
        approvedById: input.reviewerId,
      },
    });
  });

  return updated;
}

/** Magic Link only for existing, active users. */
export async function canRequestMagicLink(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { isActive: true },
  });

  return !!user?.isActive;
}
