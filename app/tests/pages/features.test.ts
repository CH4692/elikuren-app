import { test, expect } from "@playwright/test";

import { expectPageImagesLoad } from "../helpers/assets";

test.describe("Home feature components", () => {
  test("landing, chorleitung, ensembles, support images load", async ({
    page,
  }) => {
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#landing")).toBeVisible();
    await expect(page.locator("#chorleitung")).toBeVisible();
    await expect(page.locator("#joinus")).toBeVisible();
    await expect(page.locator("#support")).toBeVisible();

    await expect(page.locator("#landing img").first()).toBeVisible();
    await expect(page.locator("#chorleitung img").first()).toBeVisible();
    await expect(page.getByTestId("logo-goethe")).toBeVisible();
    await expect(page.getByTestId("logo-sparkasse")).toBeVisible();
    await expect(page.getByTestId("logo-musik-schule")).toBeVisible();

    await expectPageImagesLoad(page);
  });

  test("all ensemble cards navigate", async ({ page }) => {
    await page.goto("/home#joinus", { waitUntil: "domcontentloaded" });

    await page.getByRole("link", { name: /Elikuren entdecken/i }).click();
    await expect(page).toHaveURL(/\/ensembles\/elikuren$/);
    await page.goBack();

    await page.goto("/home#joinus", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", { name: /Eight-to-the-Bar|Männerchor entdecken/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ensembles\/eight-to-the-bar$/);

    await page.goto("/home#joinus", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", { name: /musical team entdecken/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ensembles\/musical-team$/);
  });

  test("logo navigates to home", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Logo/i }).first().click();
    await expect(page).toHaveURL(/\/home/);
  });
});

test.describe("Content pages with media", () => {
  test("history page images load", async ({ page }) => {
    await page.goto("/history", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: /Geschichte des Kammerchors Elikuren/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Zeitstrahl|Stationen/i }).first()).toBeVisible();
    await expectPageImagesLoad(page);
  });

  test("chorleitung page image loads", async ({ page }) => {
    await page.goto("/chorleitung", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Christiane Kampe" }),
    ).toBeVisible();
    await expectPageImagesLoad(page);
  });

  for (const ensemble of [
    "/ensembles/elikuren",
    "/ensembles/eight-to-the-bar",
    "/ensembles/musical-team",
  ] as const) {
    test(`${ensemble} hero and gallery images load`, async ({ page }) => {
      await page.goto(ensemble, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectPageImagesLoad(page);
      await page.getByRole("link", { name: /Kontakt aufnehmen/i }).first().click();
      await expect(page).toHaveURL(/\/contact/);
    });
  }
});

test.describe("Contact consistency", () => {
  test("mailto matches visible email", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const mailLink = page.locator('a[href^="mailto:"]').first();
    await expect(mailLink).toBeVisible();
    const href = await mailLink.getAttribute("href");
    const text = (await mailLink.innerText()).trim();
    expect(href).toBe(`mailto:${text}`);
    expect(text).toBe("kammerchor.elikuren@t-online.de");
  });
});

test.describe("Navigation coverage", () => {
  test("Über Uns destinations are reachable", async ({ page }) => {
    const destinations = [
      { path: "/about", heading: /Kammerchor Elikuren e\. V\./i },
      { path: "/chorleitung", heading: /Christiane Kampe/i },
      { path: "/history", heading: /Geschichte/i },
      { path: "/proben", heading: /Proben/i },
    ] as const;

    for (const dest of destinations) {
      await page.goto(dest.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: dest.heading }).first()).toBeVisible();
    }
  });
});
