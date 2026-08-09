import type { PrismaClient } from "@/lib/generated/prisma/client";

import { sharedE2EFixtureEmails } from "@/lib/e2e-data-markers";

export type E2ECleanupResult = {
  invoices: number;
  membershipRequests: number;
  verificationTokens: number;
  users: number;
};

/**
 * Deletes marker-based Playwright data. Keeps shared E2E fixture users and
 * all non-test content (concerts, CMS, imported members, …).
 */
export async function cleanupE2ETestData(
  prisma: PrismaClient,
  env: Record<string, string | undefined> = process.env,
): Promise<E2ECleanupResult> {
  const fixtures = sharedE2EFixtureEmails(env);

  const invoiceDelete = await prisma.invoice.deleteMany({
    where: {
      OR: [
        { invoiceNumber: { startsWith: "E2E-" } },
        { invoiceNumber: { startsWith: "UI-" } },
        { invoiceNumber: { startsWith: "INT-" } },
        { invoiceNumber: { startsWith: "RO-" } },
      ],
    },
  });

  const membershipDelete = await prisma.membershipRequest.deleteMany({
    where: {
      OR: [
        { email: { endsWith: "@example.com" } },
        { message: { contains: "Playwright", mode: "insensitive" } },
      ],
    },
  });

  const tokenDelete = await prisma.verificationToken.deleteMany({
    where: { identifier: { endsWith: "@example.com" } },
  });

  const userDelete = await prisma.user.deleteMany({
    where: {
      email: { endsWith: "@example.com" },
      NOT: { email: { in: fixtures } },
    },
  });

  // Clear profile dirt left on the shared member fixture.
  const memberEmail =
    env.E2E_MEMBER_EMAIL?.trim().toLowerCase() ||
    "e2e-member@kammerchor-elikuren.test";
  await prisma.user.updateMany({
    where: { email: memberEmail },
    data: { phone: null },
  });

  return {
    invoices: invoiceDelete.count,
    membershipRequests: membershipDelete.count,
    verificationTokens: tokenDelete.count,
    users: userDelete.count,
  };
}

export function assertE2EWipeAllowed(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.VERCEL_ENV === "production") {
    throw new Error("Refusing E2E wipe: VERCEL_ENV=production");
  }
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL || "";
  if (!url) {
    throw new Error("DATABASE_URL is required for E2E wipe");
  }
  if (url.includes("@127.0.0.1:5432/build")) {
    throw new Error("Refusing E2E wipe: placeholder build DATABASE_URL");
  }
}
