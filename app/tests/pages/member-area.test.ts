import { test, expect } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";

/**
 * Smoke coverage for the member-area hub.
 * Detailed feature tests live in dedicated files (library, invoices, …).
 */
test.describe("Mitgliederbereich Smoke", () => {
  test("admin shell shows sidebar links and overview", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Übersicht" }),
    ).toBeVisible();
    const sidebar = page.locator("aside");
    await expect(
      sidebar.getByRole("link", { name: "Mitglieder", exact: true }),
    ).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Kontakte" })).toHaveCount(
      0,
    );
    await expect(
      sidebar.getByRole("link", { name: "Zugangsanfragen" }),
    ).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Stücke" })).toHaveCount(0);
    await expect(
      sidebar.getByRole("link", { name: "Noten", exact: true }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Audiodateien" }),
    ).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Audit-Log" })).toHaveCount(
      0,
    );
    await expect(sidebar.getByRole("link", { name: "Termine" })).toHaveCount(0);
    await expect(
      sidebar.getByRole("link", { name: "Mitteilungen" }),
    ).toHaveCount(0);
  });

  test("user menu navigates to admin dashboard for admins", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Benutzermenü" }).click();
    await page.getByRole("menuitem", { name: "Admin-Dashboard" }).click();
    await expect(page).toHaveURL(/\/admin/);
  });
});
