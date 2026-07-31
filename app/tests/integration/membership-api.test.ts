import { test, expect } from "@playwright/test";

import {
  createMembershipRequest,
  findPendingRequestId,
  loginAsAdmin,
  reviewRequest,
} from "../helpers/auth";
import { getE2EMemberCredentials } from "../helpers/credentials";

test.describe("Membership API integration", () => {
  test("POST /api/membership-requests validates email and returns neutral success", async ({
    request,
  }) => {
    const email = `int-member-${Date.now()}@example.com`;
    const ok = await request.post("/api/membership-requests", {
      data: {
        email,
        firstname: "Int",
        lastname: "Test",
        voice: "Alt",
      },
    });
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.ok).toBe(true);
    expect(body.message).toMatch(/Administrator deinen Zugang freigegeben/i);

    const bad = await request.post("/api/membership-requests", {
      data: { email: "not-an-email" },
    });
    expect(bad.status()).toBe(400);
  });

  test("approval creates active member record", async ({ page }) => {
    const email = `int-approved-${Date.now()}@example.com`;
    await createMembershipRequest(page.request, {
      email,
      firstname: "Approved",
      lastname: "Member",
      voice: "Tenor",
    });

    await loginAsAdmin(page);
    const id = await findPendingRequestId(page.request, email);
    await reviewRequest(page.request, id, {
      status: "approved",
      voice: "Tenor",
    });

    const members = await page.request.get(
      `/api/admin/members?q=${encodeURIComponent(email)}`,
    );
    expect(members.ok()).toBeTruthy();
    const payload = (await members.json()) as {
      items: Array<{ email: string | null; is_active: boolean }>;
    };
    const member = payload.items.find((item) => item.email === email);
    expect(member?.is_active).toBe(true);
    expect(member?.email).toBe(email);
  });

  test("rejecting a request does not create an active member", async ({ page }) => {
    const email = `int-reject-${Date.now()}@example.com`;
    await createMembershipRequest(page.request, { email, voice: "Bass" });

    await loginAsAdmin(page);
    const id = await findPendingRequestId(page.request, email);
    await reviewRequest(page.request, id, {
      status: "rejected",
      adminNote: "Integration reject",
    });

    const members = await page.request.get(`/api/admin/members?q=${encodeURIComponent(email)}`);
    expect(members.ok()).toBeTruthy();
    const payload = (await members.json()) as { items: Array<{ email: string | null }> };
    expect(payload.items.some((item) => item.email === email)).toBe(false);
  });
});

test.describe("Members API integration", () => {
  test("admin can deactivate member and block credentials login", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const { email } = getE2EMemberCredentials();
    const list = await page.request.get(`/api/admin/members?q=${encodeURIComponent(email)}`);
    expect(list.ok()).toBeTruthy();
    const payload = (await list.json()) as {
      items: Array<{ id: string; email: string | null; is_active: boolean }>;
    };
    const member = payload.items.find((item) => item.email === email);
    expect(member).toBeTruthy();

    try {
      const patch = await page.request.patch(`/api/admin/members/${member!.id}`, {
        data: { is_active: false },
      });
      expect(patch.ok()).toBeTruthy();

      await page.context().clearCookies();
      await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
      const loginForm = page
        .locator("form")
        .filter({ has: page.getByRole("button", { name: "Anmelden" }) });
      await loginForm.locator('input[name="email"]').fill(email);
      await loginForm.locator('input[name="password"]').fill(getE2EMemberCredentials().password);
      await page.getByRole("button", { name: "Anmelden" }).click();
      await expect(page).toHaveURL(/\/auth\/(sign-in|error)/, { timeout: 15_000 });
    } finally {
      await loginAsAdmin(page);
      await page.request.patch(`/api/admin/members/${member!.id}`, {
        data: { is_active: true },
      });
    }
  });
});
