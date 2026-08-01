import { test, expect } from "@playwright/test";

test.describe("desktop navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("guest sees login and membership CTAs", async ({ page }) => {
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    const banner = page.getByRole("banner").first();
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(
      banner.getByRole("link", { name: "Mitglied werden" }),
    ).toBeVisible();
    await expect(banner.getByRole("link", { name: "Kontakt" })).toBeVisible();
  });

  test("authenticated header shows user menu without login CTAs", async ({
    page,
  }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "user_test",
            email: "mitglied@example.com",
            name: "Test Mitglied",
            firstname: "Test",
            lastname: "Mitglied",
            role: "mitglied",
          },
          expires: new Date(Date.now() + 60_000).toISOString(),
        }),
      });
    });

    await page.goto("/home", { waitUntil: "domcontentloaded" });
    const banner = page.getByRole("banner").first();
    await expect(
      banner.getByRole("button", { name: "Benutzermenü" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(banner.getByRole("link", { name: "Login" })).toHaveCount(0);
    await expect(
      banner.getByRole("link", { name: "Mitglied werden" }),
    ).toHaveCount(0);

    await banner.getByRole("button", { name: "Benutzermenü" }).click();
    await expect(
      page.getByRole("menuitem", { name: "Mitglieder-Dashboard" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Admin-Dashboard" }),
    ).toHaveCount(0);
  });

  test("vorstand user menu includes Admin-Dashboard", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "admin_test",
            email: "vorstand@example.com",
            name: "Test Vorstand",
            firstname: "Test",
            lastname: "Vorstand",
            role: "vorstand",
          },
          expires: new Date(Date.now() + 60_000).toISOString(),
        }),
      });
    });

    await page.goto("/home", { waitUntil: "domcontentloaded" });
    const banner = page.getByRole("banner").first();
    await banner.getByRole("button", { name: "Benutzermenü" }).click();
    await expect(
      page.getByRole("menuitem", { name: "Admin-Dashboard" }),
    ).toBeVisible();
  });
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens menu and reaches membership request", async ({ page }) => {
    await page.goto("/home", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    const joinLink = page
      .locator("nav")
      .getByRole("link", { name: /Mitglied werden|Mitglieder werden/i });
    await expect(joinLink).toBeVisible({ timeout: 15_000 });
    await joinLink.click();
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });
});
