import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Admin Audit", () => {
  test("member is denied audit page/API", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/audit", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
    expect((await page.request.get("/api/admin/audit")).status()).toBe(403);
  });

  test("admin can open audit UI; contacts area is gone", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/contacts", { waitUntil: "domcontentloaded" });
    // Denied admin path → /dashboard → admin home /admin
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page).not.toHaveURL(/\/admin\/contacts/);

    await page.goto("/admin/audit", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Audit/i }),
    ).toBeVisible();

    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "Kontakte" })).toHaveCount(
      0,
    );
  });

  test("unknown admin path redirects away", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/admin\/?$/);
  });
});
