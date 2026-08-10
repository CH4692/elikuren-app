import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";

test.describe("Admin Website CMS smoke", () => {
  test("edit homepage text, save, reload persists, restore", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/site");
    await expect(page.getByRole("heading", { name: "Website" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seiten" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Globale Inhalte" }),
    ).toBeVisible();

    await page.goto("/admin/site/pages/home");
    await expect(page.getByRole("heading", { name: "Startseite" })).toBeVisible({
      timeout: 15000,
    });

    const tagline = page.locator("#tagline");
    await expect(tagline).toBeVisible({ timeout: 15000 });
    const original = await tagline.inputValue();
    const marker = `E2E CMS ${Date.now()}`;

    await tagline.fill(marker);
    await expect(page.getByText("Ungespeicherte Änderungen")).toBeVisible();

    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    await page.reload();
    await expect(page.locator("#tagline")).toHaveValue(marker, {
      timeout: 15000,
    });

    await page.locator("#tagline").fill(original);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });
  });
});
