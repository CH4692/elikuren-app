import { test, expect } from "@playwright/test";

import { createEvent } from "../helpers/api";
import {
  loginAsAdmin,
  loginAsMember,
  toLocalDateTimeInput,
} from "../helpers/auth";

test.describe("Termine & RSVP", () => {
  test("admin can create event via UI", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/events", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Termine", exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Neuer Termin" }).click();
    const title = `UI Termin ${Date.now()}`;
    await page.locator("#ev-title").fill(title);
    await page
      .locator("#ev-start")
      .fill(toLocalDateTimeInput(new Date(Date.now() + 5 * 86400000)));
    await page.locator("#ev-location").fill("Kirche");
    await page.getByRole("button", { name: "Anlegen" }).click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });
  });

  test("member can RSVP yes/maybe/no", async ({ page, browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);
    const title = `RSVP ${Date.now()}`;
    await createEvent(adminPage.request, { title });
    await adminContext.close();

    await loginAsMember(page);
    await page.goto("/events", { waitUntil: "domcontentloaded" });
    const card = page.locator("li").filter({ hasText: title });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "Zusage" }).click();
    await expect(card.getByText("Zusage").first()).toBeVisible({
      timeout: 10_000,
    });
    await card.getByRole("button", { name: "Vielleicht" }).click();
    await expect(card.getByText("Vielleicht").first()).toBeVisible({
      timeout: 10_000,
    });
    await card.getByRole("button", { name: "Absage" }).click();
    await expect(card.getByText("Absage").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("admin event summary endpoint works after RSVP", async ({
    page,
    browser,
  }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);
    const event = await createEvent(adminPage.request, {
      title: `Summary ${Date.now()}`,
    });

    await loginAsMember(page);
    const rsvp = await page.request.post(`/api/events/${event.id}/rsvp`, {
      data: { status: "YES" },
    });
    expect(rsvp.ok()).toBeTruthy();

    const list = await adminPage.request.get("/api/admin/events");
    expect(list.ok()).toBeTruthy();
    const body = (await list.json()) as {
      items: Array<{ id: string; response_count: number }>;
    };
    const found = body.items.find((item) => item.id === event.id);
    expect(found?.response_count).toBeGreaterThanOrEqual(1);
    await adminContext.close();
  });
});
