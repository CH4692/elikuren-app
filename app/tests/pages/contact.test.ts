import { test, expect, type Page } from "@playwright/test";

async function gotoContact(page: Page) {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Schreib uns!" }),
  ).toBeVisible();
  // Ensure client handlers are ready, then disable native HTML5 checks.
  await expect(
    page.getByRole("button", { name: "Nachricht senden" }),
  ).toBeVisible();
  await page.locator("form").evaluate((form) => {
    (form as HTMLFormElement).noValidate = true;
  });
}

test("contact page shows form", async ({ page }) => {
  await gotoContact(page);
  await expect(page.getByText("Kontakt").first()).toBeVisible();
  await expect(page.locator("#firstName")).toBeVisible();
  await expect(page.locator("#lastName")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#subject")).toBeVisible();
  await expect(page.locator("#message")).toBeVisible();
});

test("contact form validates required fields", async ({ page }) => {
  await gotoContact(page);
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByText("Bitte Vornamen eingeben.")).toBeVisible();
  await expect(page.getByText("Bitte Nachnamen eingeben.")).toBeVisible();
  await expect(page.getByText("Bitte E-Mail eingeben.")).toBeVisible();
  await expect(page.getByText("Bitte Betreff eingeben.")).toBeVisible();
  await expect(page.getByText("Bitte Nachricht eingeben.")).toBeVisible();
});

test("contact form validates email format", async ({ page }) => {
  await gotoContact(page);
  await page.locator("#firstName").fill("Ada");
  await page.locator("#lastName").fill("Lovelace");
  // Fails app regex (needs a dot in the domain); novalidate bypasses HTML5.
  await page.locator("#email").fill("ada@example");
  await page.locator("#subject").fill("Probe");
  await page.locator("#message").fill("Hallo");
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(
    page.getByText("Bitte eine gültige E-Mail-Adresse eingeben."),
  ).toBeVisible();
});

test("contact form success with mocked API", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await gotoContact(page);
  await page.locator("#firstName").fill("Ada");
  await page.locator("#lastName").fill("Lovelace");
  await page.locator("#email").fill("ada@example.com");
  await page.locator("#subject").fill("Probe");
  await page.locator("#message").fill("Hallo vom Test");
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByText("Erfolgreich gesendet")).toBeVisible({
    timeout: 10_000,
  });
});
