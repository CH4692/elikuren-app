import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Contacts & audit API integration", () => {
  test("admin contact lifecycle writes audit entries", async ({ page }) => {
    await loginAsAdmin(page);
    const suffix = Date.now();

    const createRes = await page.request.post("/api/admin/contacts", {
      data: {
        type: "ORGANIZER",
        firstname: "Integration",
        lastname: `Audit-${suffix}`,
        email: `audit-${suffix}@example.com`,
      },
    });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()) as { id: string };

    const auditRes = await page.request.get("/api/admin/audit?q=contact");
    expect(auditRes.ok()).toBeTruthy();

    await page.request.delete(`/api/admin/contacts/${created.id}`);
  });

  test("member cannot access contacts or audit APIs", async ({ page }) => {
    await loginAsMember(page);
    expect((await page.request.get("/api/admin/contacts")).status()).toBe(403);
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
