import { test, expect } from "@playwright/test";

import {
  createMembershipRequest,
  expectPendingApprovalMessage,
  findPendingRequestId,
  loginAsAdmin,
  logout,
  requestMagicLink,
  reviewRequest,
} from "../helpers/auth";

async function openRequestReview(page: import("@playwright/test").Page, email: string) {
  const row = page
    .locator('[data-testid="membership-request"]')
    .filter({ hasText: email });
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole("button", { name: "Prüfen" }).click();
  return row;
}

test.describe("Admin Freigabeprozess", () => {
  test.describe.configure({ mode: "serial" });

  test("pending request cannot receive a magic link", async ({
    page,
    request,
  }) => {
    const email = `pending-${Date.now()}@example.com`;
    await createMembershipRequest(request, {
      email,
      firstname: "Pending",
      lastname: "Member",
      voice: "Sopran",
    });

    await requestMagicLink(page, email);
    await expectPendingApprovalMessage(page);
  });

  test("admin can approve via UI and assign voice", async ({ page, request }) => {
    const email = `ui-approve-${Date.now()}@example.com`;
    await createMembershipRequest(request, {
      email,
      firstname: "Ui",
      lastname: "Freigabe",
      voice: "Bass",
      message: "Bitte freischalten",
    });

    await loginAsAdmin(page);
    await page.goto("/admin/requests", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Zugangsanfragen" })).toBeVisible();

    await openRequestReview(page, email);
    await expect(page.getByText("Bitte freischalten")).toBeVisible();
    await page.locator("#req-voice").selectOption("Tenor");
    await page.getByLabel(/Interne Notiz/i).fill("E2E Notiz");
    await expect(
      page.getByText(/Info-E-Mail mit Link zur Login-Seite/i),
    ).toBeVisible();
    await page.getByRole("button", { name: "Freigeben" }).click();

    await page.getByRole("button", { name: "Alle", exact: true }).click();
    const approved = page
      .locator('[data-testid="membership-request"]')
      .filter({ hasText: email });
    await expect(approved.getByText("Freigegeben")).toBeVisible({
      timeout: 15_000,
    });
    await expect(approved.getByText("Tenor")).toBeVisible();
  });

  test("after approval magic-link gate no longer shows pending denial", async ({
    page,
    request,
  }) => {
    const email = `gate-${Date.now()}@example.com`;
    await createMembershipRequest(request, {
      email,
      firstname: "Gate",
      lastname: "Check",
      voice: "Alt",
    });

    await loginAsAdmin(page);
    const id = await findPendingRequestId(page.request, email);
    await reviewRequest(page.request, id, {
      status: "approved",
      voice: "Alt",
      adminNote: "API Freigabe",
    });

    await logout(page);
    await requestMagicLink(page, email);

    // Gate open → verify page (or stay off AccessDenied). With re_test key, email is mocked.
    await expect(page).not.toHaveURL(/error=AccessDenied/, {
      timeout: 20_000,
    });
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: 20_000 });
  });

  test("rejected request still cannot receive a magic link", async ({
    page,
    request,
  }) => {
    const email = `reject-${Date.now()}@example.com`;
    await createMembershipRequest(request, {
      email,
      firstname: "Reject",
      lastname: "Case",
      voice: "Bass",
    });

    await loginAsAdmin(page);
    const id = await findPendingRequestId(page.request, email);
    await reviewRequest(page.request, id, {
      status: "rejected",
      adminNote: "Passt aktuell nicht",
    });

    await logout(page);
    await requestMagicLink(page, email);
    await expectPendingApprovalMessage(page);
  });

  test("admin can reject via UI", async ({ page, request }) => {
    const email = `ui-reject-${Date.now()}@example.com`;
    await createMembershipRequest(request, {
      email,
      firstname: "Ui",
      lastname: "Ablehnung",
    });

    await loginAsAdmin(page);
    await page.goto("/admin/requests", { waitUntil: "domcontentloaded" });

    await openRequestReview(page, email);
    await page.getByRole("button", { name: "Ablehnen" }).click();

    await page.getByRole("button", { name: "Alle", exact: true }).click();
    const rejected = page
      .locator('[data-testid="membership-request"]')
      .filter({ hasText: email });
    await expect(rejected.getByText("Abgelehnt")).toBeVisible({
      timeout: 15_000,
    });
  });
});
