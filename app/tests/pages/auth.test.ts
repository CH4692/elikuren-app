import { test, expect } from "@playwright/test";

test("sign-in page", async ({ page }) => {
  await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Mitglieder Login" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Login-Link senden" }),
  ).toBeVisible();
});

test("sign-up is membership request form", async ({ page }) => {
  await page.goto("/auth/sign-up", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Mitglied werden" }),
  ).toBeVisible();
  await expect(
    page.getByText(/vom Vorstand freigeschaltet/i),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Anfrage absenden" })).toBeVisible();
});

test("verify request page", async ({ page }) => {
  await page.goto("/auth/verify", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "E-Mail prüfen" }),
  ).toBeVisible();
});

test("auth access denied page shows neutral pending message", async ({
  page,
}) => {
  await page.goto("/auth/error?error=AccessDenied", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: "Anfrage erfasst" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Falls dein Zugang bereits freigegeben wurde, erhältst du in Kürze einen Anmeldelink\. Andernfalls wirst du informiert, sobald ein Administrator deinen Zugang freigegeben hat\./,
    ),
  ).toBeVisible();
  await page.getByRole("link", { name: "Mitgliedschaft beantragen" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-up/);
});

test("unauthenticated api/me returns 401", async ({ request }) => {
  const response = await request.get("/api/me");
  expect(response.status()).toBe(401);
});
