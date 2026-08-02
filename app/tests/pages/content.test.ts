import { test, expect } from "@playwright/test";

test("about page", async ({ page }) => {
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Kammerchor Elikuren e. V." }),
  ).toBeVisible();
  await expect(page.getByText(/VR 203208/).first()).toBeVisible();
});

test("chorleitung page", async ({ page }) => {
  await page.goto("/chorleitung", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Christiane Kampe" }),
  ).toBeVisible();
  await expect(page.getByText(/Musikschule Wunstorf/).first()).toBeVisible();
});

test("proben page", async ({ page }) => {
  await page.goto("/proben", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Proben & Einstieg" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Häufige Fragen" }),
  ).toBeVisible();
});

test("history page", async ({ page }) => {
  await page.goto("/history", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", {
      name: /Geschichte des Kammerchors Elikuren/i,
    }),
  ).toBeVisible();
});

test("impressum page", async ({ page }) => {
  await page.goto("/impressum", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Impressum" })).toBeVisible();
});

test("datenschutz page", async ({ page }) => {
  await page.goto("/datenschutz", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /Datenschutzerklärung/i }),
  ).toBeVisible();
});
