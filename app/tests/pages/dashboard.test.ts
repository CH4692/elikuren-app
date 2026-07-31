import { test, expect } from "@playwright/test";

import { createAnnouncement, createEvent } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Dashboard", () => {
  test("member lands on dashboard after login and sees hub links", async ({
    page,
  }) => {
    await loginAsMember(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Hallo/i })).toBeVisible();
    const hub = page.locator("main");
    await expect(hub.getByRole("link", { name: "Noten" })).toBeVisible();
    await expect(hub.getByRole("link", { name: "Audio" })).toBeVisible();
    await expect(hub.getByRole("link", { name: "Mitteilungen" })).toBeVisible();
    await expect(hub.getByRole("link", { name: "Profil" })).toBeVisible();
  });

  test("dashboard shows important announcement and next-event card", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const title = `Dash Mitteilung ${Date.now()}`;
    const eventTitle = `Dash Termin ${Date.now()}`;
    await createAnnouncement(page.request, { title, publish: true });
    await createEvent(page.request, {
      title: eventTitle,
      startsAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Wichtige Mitteilungen")).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();

    await page.goto("/events", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(eventTitle)).toBeVisible({ timeout: 15_000 });
  });

  test("admin sees Verwaltung card, member does not", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator("main").getByRole("link", { name: "Verwaltung" }),
    ).toBeVisible();

    await page.context().clearCookies();
    await loginAsMember(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator("main").getByRole("link", { name: "Verwaltung" }),
    ).toHaveCount(0);
  });
});
