import { test, expect } from "@playwright/test";

import { loginAsMember } from "../helpers/auth";

test.describe("Mitglieder-Bibliothek", () => {
  test("scores and audio pages load for members", async ({ page }) => {
    await loginAsMember(page);

    await page.goto("/library/scores", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Noten" })).toBeVisible();
    await expect(page.getByText("Mitgliederbereich")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Aktuelles Konzert" }),
    ).toBeVisible();
    await expect(page.getByLabel("Besetzung")).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Alle Besetzungen" }),
    ).toBeAttached();

    await page.goto("/library/audio", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Audio & Üben", exact: true }),
    ).toBeVisible();
  });

  test("library scores and audio APIs work for members", async ({ page }) => {
    await loginAsMember(page);

    const scoresRes = await page.request.get("/api/library/scores");
    expect(scoresRes.ok()).toBeTruthy();
    const scoresBody = (await scoresRes.json()) as {
      items: unknown[];
      my_voice: string | null;
    };
    expect(Array.isArray(scoresBody.items)).toBe(true);
    expect(scoresBody.my_voice).toBeTruthy();

    const audioRes = await page.request.get("/api/library/audio");
    expect(audioRes.ok()).toBeTruthy();
    const audioBody = (await audioRes.json()) as { items: unknown[] };
    expect(Array.isArray(audioBody.items)).toBe(true);
  });

  test("guest cannot open library pages", async ({ page }) => {
    await page.goto("/library/scores", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await page.goto("/library/audio", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
