import { test, expect } from "@playwright/test";

import { PUBLIC_ROUTES } from "../helpers/assets";

for (const route of PUBLIC_ROUTES) {
  test(`${route} responds successfully`, async ({ request }) => {
    const res = await request.get(route);
    expect(res.status(), route).toBeLessThan(400);
    expect(res.status(), `${route} should not 404`).not.toBe(404);
  });
}

test("root resolves to home content", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/home/);
  await expect(page.locator("#landing")).toBeVisible();
});
