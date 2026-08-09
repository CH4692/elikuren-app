import { expect, type APIRequestContext, type Page } from "@playwright/test";

import {
  getE2EAdminCredentials,
  getE2EAuditorCredentials,
  getE2EMemberCredentials,
  PENDING_APPROVAL_MESSAGE,
} from "./credentials";

async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
  const form = page.locator('form[data-testid="password-sign-in"]');
  // Wait until client hydration enables submit (avoids native GET before React is ready).
  await expect(form.getByRole("button", { name: "Anmelden" })).toBeEnabled({
    timeout: 60_000,
  });

  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="password"]').fill(password);
  await Promise.all([
    page.waitForURL(/\/(dashboard|profile|admin)/, { timeout: 30_000 }),
    form.getByRole("button", { name: "Anmelden" }).click(),
  ]);
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = getE2EAdminCredentials();
  await loginWithCredentials(page, email, password);
  await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
}

export async function loginAsMember(page: Page) {
  const { email, password } = getE2EMemberCredentials();
  await loginWithCredentials(page, email, password);
}

export async function loginAsAuditor(page: Page) {
  const { email, password } = getE2EAuditorCredentials();
  await loginWithCredentials(page, email, password);
}

export async function logout(page: Page) {
  await page.context().clearCookies();
}

export async function createMembershipRequest(
  request: APIRequestContext,
  input: {
    email: string;
    firstname?: string;
    lastname?: string;
    voice?: string;
    message?: string;
  },
) {
  const res = await request.post("/api/membership-requests", {
    data: {
      email: input.email,
      firstname: input.firstname ?? "E2E",
      lastname: input.lastname ?? "Bewerber",
      voice: input.voice ?? "Alt",
      message: input.message ?? "Playwright Freigabe-Test",
    },
  });
  expect(res.status()).toBe(200);
  return res.json();
}

export async function findPendingRequestId(
  request: APIRequestContext,
  email: string,
) {
  const res = await request.get("/api/admin/membership-requests?status=pending");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as {
    items: Array<{ id: string; email: string }>;
  };
  const item = body.items.find((entry) => entry.email === email);
  expect(item, `pending request for ${email}`).toBeTruthy();
  return item!.id;
}

export async function reviewRequest(
  request: APIRequestContext,
  id: string,
  body: {
    status: "approved" | "rejected";
    voice?: string | null;
    adminNote?: string | null;
  },
) {
  const res = await request.patch(`/api/admin/membership-requests/${id}`, {
    data: body,
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

/** Create an active member via the approval flow (admin session on `request`). */
export async function approveMemberRequest(
  request: APIRequestContext,
  email: string,
  voice = "Alt",
) {
  await createMembershipRequest(request, { email, voice });
  const id = await findPendingRequestId(request, email);
  await reviewRequest(request, id, { status: "approved", voice });
}

export async function requestMagicLink(page: Page, email: string) {
  await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
  const form = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Login-Link senden" }) });
  await form.locator('input[name="email"]').fill(email);
  await form.getByRole("button", { name: "Login-Link senden" }).click();
}

export async function expectPendingApprovalMessage(page: Page) {
  await expect(page).toHaveURL(/\/auth\/error/, { timeout: 15_000 });
  await expect(page.getByText(PENDING_APPROVAL_MESSAGE)).toBeVisible();
}

export function toLocalDateTimeInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export { PENDING_APPROVAL_MESSAGE };
