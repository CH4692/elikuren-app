import { test, expect } from "@playwright/test";

import { getE2EMemberCredentials } from "../helpers/credentials";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Admin Mitglieder", () => {
  test("admin can list and search members", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Mitglieder/i }),
    ).toBeVisible();

    const { email } = getE2EMemberCredentials();
    await page.getByPlaceholder(/Suche nach Name/i).fill(email);
    await page.getByRole("button", { name: "Suchen" }).click();
    await expect(page.getByText(email)).toBeVisible({ timeout: 10_000 });
  });

  test("admin can change member voice", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });

    const { email } = getE2EMemberCredentials();
    await page.getByPlaceholder(/Suche nach Name/i).fill(email);
    await page.getByRole("button", { name: "Suchen" }).click();
    const card = page.locator("li").filter({ hasText: email });
    await expect(card).toBeVisible({ timeout: 10_000 });

    const voiceSelect = card.locator("select").nth(1);
    await voiceSelect.selectOption("Tenor");
    await card.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Mitglied aktualisiert")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("member cannot access members admin", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/admin\/members$/);
  });
});
