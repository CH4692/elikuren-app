import { expect, test } from "@playwright/test";

import { PUBLIC_ROUTES } from "../helpers/assets";

/**
 * Lightweight integrity: known public registry + sample internal nav links.
 * Avoids unbounded crawling of dynamic/private URLs.
 */
test.describe("route integrity", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} is not 404/5xx`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status(), route).toBeLessThan(500);
      expect(res.status(), `${route} missing`).not.toBe(404);
    });
  }

  test("home exposes expected internal nav targets", async ({ page }) => {
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#landing").first()).toBeAttached();
    await expect(page.locator("#chorleitung").first()).toBeAttached();
    await expect(page.locator("#joinus").first()).toBeAttached();
    await expect(page.locator("#support").first()).toBeAttached();

    const hrefs = await page.locator("a[href^='/']").evaluateAll((anchors) =>
      [...new Set(anchors.map((a) => (a as HTMLAnchorElement).pathname))].filter(
        (p) =>
          p.startsWith("/") &&
          !p.startsWith("/api") &&
          !p.startsWith("/_next") &&
          p !== "/",
      ),
    );

    for (const path of ["/contact", "/ensembles/elikuren"] as const) {
      expect(hrefs, `home should link to ${path}`).toContain(path);
    }
  });
});

