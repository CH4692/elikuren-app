import { test, expect } from "@playwright/test";

test("root redirects to home", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/home$/);
});

test("landing page loads with brand hero", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Elikuren/i);
  await expect(page.locator("#landing")).toBeVisible();
  await expect(page.getByText("Kammerchor Elikuren").first()).toBeVisible();
});

test("home sections are present", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#chorleitung")).toBeVisible();
  await expect(page.locator("#joinus")).toBeVisible();
  await expect(page.locator("#concerts")).toBeVisible();
  await expect(page.locator("#support")).toBeVisible();
  await expect(page.locator("#footer")).toBeVisible();
});

test("ensemble cards link to ensemble pages", async ({ page }) => {
  await page.goto("/home#joinus", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: /Elikuren entdecken/i }).click();
  await expect(page).toHaveURL(/\/ensembles\/elikuren$/);
});

test("footer legal links work", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await page.locator("#footer").getByRole("link", { name: "Impressum" }).click();
  await expect(page).toHaveURL(/\/impressum/);
});
