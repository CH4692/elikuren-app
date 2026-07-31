import { test, expect } from "@playwright/test";

import { getE2EMemberCredentials } from "../helpers/credentials";
import {
  approveMemberRequest,
  loginAsAdmin,
  loginAsMember,
} from "../helpers/auth";

test.describe("Admin Mitglieder UI", () => {
  test("admin can search members in table", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Mitglieder/i })).toBeVisible();

    const { email } = getE2EMemberCredentials();
    await page.getByPlaceholder(/Name, E-Mail, Stimme/i).fill(email);
    await page.getByRole("button", { name: "Suchen" }).click();
    await expect(page.getByText(email)).toBeVisible({ timeout: 10_000 });
  });

  test("admin can change member voice in drawer", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });

    const { email } = getE2EMemberCredentials();
    await page.getByPlaceholder(/Name, E-Mail, Stimme/i).fill(email);
    await page.getByRole("button", { name: "Suchen" }).click();
    await expect(page.getByText(email)).toBeVisible({ timeout: 10_000 });

    const row = page.locator("tr").filter({ hasText: email });
    await row.getByRole("button", { name: /bearbeiten/i }).click();
    await page.locator("#mem-voice").selectOption("Tenor");
    await page.getByRole("button", { name: "Speichern", exact: true }).click();
    await expect(page.getByText("Mitglied aktualisiert")).toBeVisible({
      timeout: 10_000,
    });

    await row.getByRole("button", { name: /bearbeiten/i }).click();
    await page.locator("#mem-voice").selectOption("Sopran");
    await page.getByRole("button", { name: "Speichern", exact: true }).click();
    await expect(page.getByText("Mitglied aktualisiert")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("admin can deactivate member in drawer", async ({ page }) => {
    await loginAsAdmin(page);
    const email = `deact-ui-${Date.now()}@example.com`;
    await approveMemberRequest(page.request, email, "Bass");

    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
    await page.getByPlaceholder(/Name, E-Mail, Stimme/i).fill(email);
    await page.getByRole("button", { name: "Suchen" }).click();
    const row = page.locator("tr").filter({ hasText: email });
    await expect(row).toBeVisible({ timeout: 10_000 });

    await row.getByRole("button", { name: /bearbeiten/i }).click();
    await page.locator("#mem-active").selectOption("inactive");
    await page.getByRole("button", { name: "Speichern", exact: true }).click();
    await expect(page.getByText("Mitglied aktualisiert")).toBeVisible({
      timeout: 10_000,
    });
    await expect(row.getByText("Inaktiv")).toBeVisible();
  });

  test("member cannot access members admin", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
