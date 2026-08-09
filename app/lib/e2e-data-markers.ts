/**
 * Markers used to identify Playwright / E2E rows on the Preview Neon DB.
 * Shared fixture users (`e2e-*@kammerchor-elikuren.test`) are intentionally kept.
 */

export const E2E_INVOICE_NUMBER_RE = /^(E2E|UI|INT|RO|EDIT|ARCH|FILE)-/;

/** Ephemeral membership / approved-user emails created by Playwright. */
export function isE2EEphemeralEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith("@example.com");
}

export function isE2EInvoiceNumber(invoiceNumber: string | null | undefined): boolean {
  if (!invoiceNumber) return false;
  return E2E_INVOICE_NUMBER_RE.test(invoiceNumber.trim());
}

/** Membership-request messages written by the auth test helper. */
export function isE2EMembershipMessage(
  message: string | null | undefined,
): boolean {
  if (!message) return false;
  return /playwright/i.test(message);
}

export function sharedE2EFixtureEmails(
  env: Record<string, string | undefined> = process.env,
) {
  return [
    env.E2E_ADMIN_EMAIL?.trim().toLowerCase() ||
      env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
      "e2e-admin@kammerchor-elikuren.test",
    env.E2E_MEMBER_EMAIL?.trim().toLowerCase() ||
      "e2e-member@kammerchor-elikuren.test",
    env.E2E_AUDITOR_EMAIL?.trim().toLowerCase() ||
      "e2e-kassenpruefer@kammerchor-elikuren.test",
  ];
}
