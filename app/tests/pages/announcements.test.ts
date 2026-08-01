import { test, expect } from "@playwright/test";

import { createAnnouncement } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Mitteilungen", () => {
  test("admin can create and publish announcement via UI", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/announcements", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Mitteilungen verwalten/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Neue Mitteilung" }).click();
    const title = `UI Mitteilung ${Date.now()}`;
    await page.locator("#ann-title").fill(title);
    await page.locator("#ann-body").fill("Wichtiger Hinweis für den Chor.");
    await page.getByText("Sofort veröffentlichen").click();
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });
  });

  test("member sees published announcement and can mark read", async ({
    page,
    browser,
  }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);
    const title = `Member Mitteilung ${Date.now()}`;
    await createAnnouncement(adminPage.request, { title, publish: true });
    await adminContext.close();

    await loginAsMember(page);
    await page.goto("/announcements", { waitUntil: "domcontentloaded" });
    const card = page.locator("li").filter({ hasText: title });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "Als gelesen markieren" }).click();
    await expect(card.getByText("Gelesen")).toBeVisible({ timeout: 10_000 });
  });

  test("draft announcement is not listed for members", async ({
    page,
    browser,
  }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);
    const title = `Draft Mitteilung ${Date.now()}`;
    await createAnnouncement(adminPage.request, { title, publish: false });
    await adminContext.close();

    await loginAsMember(page);
    const res = await page.request.get("/api/announcements");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { items: Array<{ title: string }> };
    expect(body.items.some((item) => item.title === title)).toBe(false);
  });
});
