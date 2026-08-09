import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Dashboard", () => {
  test("member lands on dashboard after login and sees hub links", async ({
    page,
  }) => {
    await loginAsMember(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Hallo/i })).toBeVisible();
    await expect(
      page.getByText(/Aktuelles Konzertprogramm, Notenkatalog und Übedateien/),
    ).toBeVisible();
    const hub = page.locator("main");
    await expect(hub.getByRole("link", { name: /Noten/i }).first()).toBeVisible();
    await expect(hub.getByRole("link", { name: /Audio/i }).first()).toBeVisible();
    await expect(hub.getByRole("link", { name: /Profil/i }).first()).toBeVisible();
    await expect(hub.getByRole("link", { name: /Verwaltung/i })).toHaveCount(0);
    await expect(hub.getByRole("link", { name: /Mitteilungen/i })).toHaveCount(0);
    await expect(hub.getByRole("link", { name: /Termine/i })).toHaveCount(0);
    await expect(hub.getByRole("heading", { name: "Schnellzugriff" })).toBeVisible();
    await expect(
      hub.getByRole("heading", { name: "Aktuelles Konzert" }),
    ).toBeVisible();
    await expect(
      hub.getByRole("heading", { name: "Neu in der Bibliothek" }),
    ).toHaveCount(0);
  });

  test("admin can open member dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Hallo/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Schnellzugriff" }),
    ).toBeVisible();
  });
});
