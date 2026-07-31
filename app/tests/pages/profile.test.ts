import { test, expect } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";
import { getE2EMemberCredentials } from "../helpers/credentials";

test.describe("Profil UI", () => {
  test("member can view and update profile fields", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Mein Profil" })).toBeVisible();

    const phone = `+49 ${Date.now().toString().slice(-8)}`;
    await page.getByLabel(/Telefon/i).fill(phone);
    await page.getByRole("button", { name: "Profil speichern" }).click();
    await expect(page.getByText("Profil gespeichert")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("guest is redirected away from profile", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});

test.describe("Admin scores & audio UI", () => {
  test("admin can open scores and audio admin pages", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/scores", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Noten & PDFs" })).toBeVisible();
    await page.goto("/admin/audio", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Audiodateien" })).toBeVisible();
  });

  test("member is redirected from scores admin", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/scores", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/admin\/scores$/);
  });
});

test.describe("Admin shell UI", () => {
  test("admin sidebar navigation reaches key modules", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Übersicht" })).toBeVisible();

    await page.getByRole("link", { name: "Mitglieder" }).click();
    await expect(page).toHaveURL(/\/admin\/members/);
    await expect(page.getByRole("heading", { name: /Mitglieder/i })).toBeVisible();

    await page.getByRole("link", { name: "Zugangsanfragen" }).click();
    await expect(page).toHaveURL(/\/admin\/requests/);
  });
});
