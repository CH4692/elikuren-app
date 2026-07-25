import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/home");
  await expect(page).toHaveTitle(/Elikuren/i);
});

test("chorleitung section is reachable", async ({ page }) => {
  await page.goto("/home#chorleitung");
  await expect(page.locator("#chorleitung")).toBeVisible();
});

test("concerts section is reachable", async ({ page }) => {
  await page.goto("/home#concerts");
  await expect(page.locator("#concerts")).toBeVisible();
});
