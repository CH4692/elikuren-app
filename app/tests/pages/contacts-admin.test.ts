import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Admin Kontakte & Audit", () => {
  test("member is denied contacts and audit pages/APIs", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/contacts", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/admin/audit", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
    expect((await page.request.get("/api/admin/contacts")).status()).toBe(403);
    expect((await page.request.get("/api/admin/audit")).status()).toBe(403);
  });

  test("admin can CRUD contact via API and open UI", async ({ page }) => {
    await loginAsAdmin(page);

    const suffix = Date.now();
    const createRes = await page.request.post("/api/admin/contacts", {
      data: {
        type: "MUSICIAN",
        firstname: "E2E",
        lastname: `Kontakt-${suffix}`,
        email: `e2e-kontakt-${suffix}@example.com`,
        organization: "Test Orchester",
      },
    });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()) as { id: string };
    expect(created.id).toBeTruthy();

    const listRes = await page.request.get(
      `/api/admin/contacts?q=Kontakt-${suffix}`,
    );
    expect(listRes.ok()).toBeTruthy();
    const list = (await listRes.json()) as {
      items: Array<{ id: string; lastname: string | null }>;
    };
    expect(list.items.some((item) => item.id === created.id)).toBeTruthy();

    const patchRes = await page.request.patch(
      `/api/admin/contacts/${created.id}`,
      { data: { phone: "+49 123", notes: "Playwright" } },
    );
    expect(patchRes.ok()).toBeTruthy();

    await page.goto("/admin/contacts", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Kontakte/i }),
    ).toBeVisible();

    const archiveRes = await page.request.patch(
      `/api/admin/contacts/${created.id}`,
      { data: { archived: true } },
    );
    expect(archiveRes.ok()).toBeTruthy();

    const deleteRes = await page.request.delete(
      `/api/admin/contacts/${created.id}`,
    );
    expect(deleteRes.ok()).toBeTruthy();

    const auditRes = await page.request.get("/api/admin/audit?q=contact");
    expect(auditRes.ok()).toBeTruthy();
    await page.goto("/admin/audit", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Audit/i }),
    ).toBeVisible();
  });

  test("unknown admin path redirects member-area users with access away", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
