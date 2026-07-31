import { test, expect } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";

/**
 * Smoke coverage for the member-area hub.
 * Detailed feature tests live in dedicated files (pieces, events, …).
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
    await expect(sidebar.getByRole("link", { name: "Kontakte" })).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Zugangsanfragen" }),
    ).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Stücke" })).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Noten & PDFs" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Audiodateien" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Audit-Log" }),
    ).toBeVisible();
  });

  test("user menu navigates to dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Benutzermenü" }).click();
    await page.getByRole("menuitem", { name: "Mitglieder-Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
