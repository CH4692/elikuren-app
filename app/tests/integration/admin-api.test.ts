import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Audit API integration", () => {
  test("admin can read audit log", async ({ page }) => {
    await loginAsAdmin(page);
    const auditRes = await page.request.get("/api/admin/audit");
    expect(auditRes.ok()).toBeTruthy();
  });

  test("member cannot access audit API", async ({ page }) => {
    await loginAsMember(page);
    expect((await page.request.get("/api/admin/audit")).status()).toBe(403);
  });
});

test.describe("Health API integration", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
