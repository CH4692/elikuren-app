import { test, expect } from "@playwright/test";

import { createPiece, publishPiece } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Mitglieder-Bibliothek", () => {
  test("scores and audio pages load for members", async ({ page }) => {
    await loginAsMember(page);

    await page.goto("/library/scores", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Noten", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Meine Stimme")).toBeVisible();

    await page.goto("/library/audio", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Audio/i }),
    ).toBeVisible();
  });

  test("library list API returns published pieces for members", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const title = `API Lib ${Date.now()}`;
    const piece = await createPiece(page.request, {
      title,
      composer: "Haydn",
    });
    await publishPiece(page.request, piece.id);

    await page.context().clearCookies();
    await loginAsMember(page);

    const res = await page.request.get("/api/library/pieces");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      items: Array<{ id: string; title: string }>;
      my_voice: string | null;
    };
    expect(body.my_voice).toBeTruthy();
    expect(body.items.some((item) => item.id === piece.id)).toBe(true);

    await page.goto(`/library/pieces/${piece.id}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("guest cannot open library pages", async ({ page }) => {
    await page.goto("/library/scores", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await page.goto("/library/audio", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
