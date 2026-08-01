import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsAuditor, loginAsMember } from "../helpers/auth";

const guestDenied = [
  "/api/me",
  "/api/library/scores",
  "/api/library/audio",
  "/api/admin/scores",
  "/api/admin/audio",
  "/api/admin/members",
  "/api/admin/invoices",
  "/api/admin/files/presign",
] as const;

test.describe("API AuthZ", () => {
  for (const path of guestDenied) {
    test(`guest denied for ${path}`, async ({ request }) => {
      const res = await request.get(path);
      expect([401, 403, 405]).toContain(res.status());
    });
  }

  test("member can read library but not admin write APIs", async ({ page }) => {
    await loginAsMember(page);
    expect((await page.request.get("/api/library/scores")).ok()).toBeTruthy();
    expect((await page.request.get("/api/library/audio")).ok()).toBeTruthy();
    expect((await page.request.get("/api/me")).ok()).toBeTruthy();

    expect((await page.request.get("/api/admin/scores")).status()).toBe(403);
    expect((await page.request.get("/api/admin/audio")).status()).toBe(403);
    expect((await page.request.get("/api/admin/members")).status()).toBe(403);
    expect((await page.request.get("/api/admin/invoices")).status()).toBe(403);
  });

  test("auditor can read invoices but not manage library", async ({ page }) => {
    await loginAsAuditor(page);
    expect((await page.request.get("/api/admin/invoices")).ok()).toBeTruthy();
    expect((await page.request.get("/api/admin/scores")).status()).toBe(403);
    expect((await page.request.get("/api/admin/audio")).status()).toBe(403);
    expect((await page.request.get("/api/admin/members")).status()).toBe(403);
  });

  test("admin can access all admin list APIs", async ({ page }) => {
    await loginAsAdmin(page);
    for (const path of [
      "/api/admin/members",
      "/api/admin/invoices",
      "/api/admin/membership-requests",
      "/api/admin/scores",
      "/api/admin/audio",
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
