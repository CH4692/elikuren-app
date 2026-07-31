import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

const guestDenied = [
  "/api/me",
  "/api/library/pieces",
  "/api/announcements",
  "/api/admin/pieces",
  "/api/admin/members",
  "/api/admin/announcements",
  "/api/admin/files/presign",
] as const;

test.describe("API AuthZ", () => {
  for (const path of guestDenied) {
    test(`guest denied for ${path}`, async ({ request }) => {
      const res = await request.get(path);
      expect([401, 403, 405]).toContain(res.status());
    });
  }

  test("member can read library and announcements but not admin write APIs", async ({
    page,
  }) => {
    await loginAsMember(page);
    expect((await page.request.get("/api/library/pieces")).ok()).toBeTruthy();
    expect((await page.request.get("/api/announcements")).ok()).toBeTruthy();
    expect((await page.request.get("/api/me")).ok()).toBeTruthy();

    expect((await page.request.get("/api/admin/pieces")).status()).toBe(403);
    expect((await page.request.get("/api/admin/members")).status()).toBe(403);
    expect((await page.request.get("/api/admin/announcements")).status()).toBe(
      403,
    );
  });

  test("admin can access member-area admin list APIs", async ({ page }) => {
    await loginAsAdmin(page);
    for (const path of [
      "/api/admin/pieces",
      "/api/admin/members",
      "/api/admin/announcements",
      "/api/admin/membership-requests",
    ]) {
      expect((await page.request.get(path)).ok()).toBeTruthy();
    }
  });

  test("presign without R2 or without permission is rejected for members", async ({
    page,
  }) => {
    await loginAsMember(page);
    const res = await page.request.post("/api/admin/files/presign", {
      data: {
        category: "SHEET",
        originalName: "x.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
      },
    });
    expect([403, 503]).toContain(res.status());
  });
});
