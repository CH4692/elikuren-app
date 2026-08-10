import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";
import { PUBLIC_SITE_PAGE_KEYS } from "../../lib/site-content/registry";
import { GLOBAL_SECTION_KEYS } from "../../lib/site-content/defaults";

test.describe("Admin CMS registry + form safety", () => {
  test("every registered page editor has no unknown-page warning", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    for (const pageKey of PUBLIC_SITE_PAGE_KEYS) {
      await page.goto(`/admin/site/pages/${pageKey}`);
      await expect(page.getByRole("heading").first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Unbekannte Seite")).toHaveCount(0);
      await expect(page.getByText("Seite nicht gefunden")).toHaveCount(0);

      const inputs = page.locator("input, textarea");
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const value = await inputs.nth(i).inputValue().catch(() => "");
        expect(value).not.toBe("[object Object]");
        expect(value.toLowerCase()).not.toBe("object");
        expect(value).not.toMatch(/^\s*\{[\s\S]*\}\s*$/);
        expect(value).not.toMatch(/^\s*\[[\s\S]*\]\s*$/);
      }
    }
  });

  test("every global section editor has no unknown-page warning", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    for (const sectionKey of GLOBAL_SECTION_KEYS) {
      await page.goto(`/admin/site/global/${sectionKey}`);
      await expect(page.getByRole("heading").first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Unbekannte Seite")).toHaveCount(0);

      const inputs = page.locator("input, textarea");
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const value = await inputs.nth(i).inputValue().catch(() => "");
        expect(value).not.toBe("[object Object]");
        expect(value.toLowerCase()).not.toBe("object");
      }
    }
  });
});
