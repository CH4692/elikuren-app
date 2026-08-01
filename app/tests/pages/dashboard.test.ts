import { test, expect } from "@playwright/test";

import { createEvent } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Dashboard", () => {
  test("member lands on dashboard after login and sees hub links", async ({
    page,
  }) => {
    await loginAsMember(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Hallo/i })).toBeVisible();
    await expect(
      page.getByText(
        /Schön, dass du da bist\. Alle wichtigen Unterlagen für das aktuelle Chorprojekt findest du hier\./,
      ),
    ).toBeVisible();
    const hub = page.locator("main");
    await expect(hub.getByRole("link", { name: /Noten/i }).first()).toBeVisible();
    await expect(hub.getByRole("link", { name: /Audio/i }).first()).toBeVisible();
    await expect(hub.getByRole("link", { name: /Profil/i }).first()).toBeVisible();
    await expect(
      hub.getByRole("link", { name: /Mitteilungen/i }),
    ).toHaveCount(0);
    await expect(hub.getByRole("heading", { name: "Schnellzugriff" })).toBeVisible();
    await expect(
      hub.getByRole("heading", { name: "Aktuelles Projekt" }),
    ).toBeVisible();
  });

  test("dashboard shows next event card", async ({ page }) => {
    await loginAsAdmin(page);
    const eventTitle = `Dash Termin ${Date.now()}`;
    await createEvent(page.request, {
      title: eventTitle,
      startsAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Nächster Termin")).toBeVisible();
    await expect(page.getByText(eventTitle)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Probenraum/)).toBeVisible();
    await expect(page.getByText("Wichtige Mitteilungen")).toHaveCount(0);
  });

  test("admin sees Verwaltung card, member does not", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator("main").getByRole("link", { name: /Verwaltung/i }),
    ).toBeVisible();

    await page.context().clearCookies();
    await loginAsMember(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator("main").getByRole("link", { name: /Verwaltung/i }),
    ).toHaveCount(0);
  });
});
