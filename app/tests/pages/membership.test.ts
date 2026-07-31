import { test, expect } from "@playwright/test";

test("membership request can be submitted via UI", async ({ page }) => {
  const email = `probe-${Date.now()}@example.com`;

  await page.goto("/auth/sign-up", { waitUntil: "domcontentloaded" });
  await page.locator("#firstname").fill("Probe");
  await page.locator("#lastname").fill("Sänger");
  await page.locator("#email").fill(email);
  await page.locator("#voice").fill("Alt");
  await page.locator("#message").fill("Ich möchte mitsingen.");
  await page.getByRole("button", { name: "Anfrage absenden" }).click();

  await expect(
    page.getByRole("heading", { name: "Anfrage eingegangen" }),
  ).toBeVisible({ timeout: 15_000 });
});

test("membership request API always returns neutral success", async ({
  request,
}) => {
  const email = `api-${Date.now()}@example.com`;
  const res = await request.post("/api/membership-requests", {
    data: {
      email,
      firstname: "Api",
      lastname: "Test",
      voice: "Bass",
      message: "API Test",
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.message).toMatch(/Zugang bereits freigegeben|Administrator deinen Zugang freigegeben/i);

  const duplicate = await request.post("/api/membership-requests", {
    data: { email, firstname: "Api", lastname: "Test" },
  });
  expect(duplicate.status()).toBe(200);
  const duplicateBody = await duplicate.json();
  expect(duplicateBody.ok).toBe(true);
  expect(duplicateBody.message).toMatch(/Zugang bereits freigegeben|Administrator deinen Zugang freigegeben/i);
});

test("unknown email gets neutral pending message instead of magic link", async ({
  page,
}) => {
  await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
  await page
    .locator('form')
    .filter({ has: page.getByRole("button", { name: "Login-Link senden" }) })
    .locator('input[name="email"]')
    .fill(`denied-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Login-Link senden" }).click();
  await expect(page).toHaveURL(/\/auth\/error/, { timeout: 15_000 });
  await expect(
    page.getByText(
      /Falls dein Zugang bereits freigegeben wurde, erhältst du in Kürze einen Anmeldelink\. Andernfalls wirst du informiert, sobald ein Administrator deinen Zugang freigegeben hat\./,
    ),
  ).toBeVisible();
});
