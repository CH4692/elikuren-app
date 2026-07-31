import { test, expect } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";

test.describe("Mitgliederbereich Smoke", () => {
  test("admin hub shows permission-based links", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Verwaltung" }),
    ).toBeVisible();
    const hub = page.locator("main");
    await expect(hub.locator('a[href="/admin/requests"]')).toBeVisible();
    await expect(hub.locator('a[href="/admin/pieces"]')).toBeVisible();
    await expect(hub.locator('a[href="/admin/members"]')).toBeVisible();
    await expect(hub.locator('a[href="/admin/announcements"]')).toBeVisible();
  });

  test("nav Bereich link goes to dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Bereich" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
