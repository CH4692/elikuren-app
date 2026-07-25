import { test, expect } from "@playwright/test";

test("navigation is visible", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("banner").first()).toBeVisible();
});
