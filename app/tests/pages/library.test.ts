import { test, expect } from "@playwright/test";

import { createPiece } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Mitglieder-Bibliothek", () => {
  test("scores and audio pages load for members", async ({ page }) => {
    await loginAsMember(page);

    await page.goto("/library/scores", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Noten & Stücke" }),
    ).toBeVisible();
    await expect(page.getByText("Meine Stimme")).toBeVisible();

    await page.goto("/library/audio", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Audio & Üben", exact: true }),
    ).toBeVisible();
  });

  test("library list API works for members; empty pieces stay hidden", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const title = `API Lib ${Date.now()}`;
    const piece = await createPiece(page.request, {
      title,
      composer: "Haydn",
    });

    await page.context().clearCookies();
    await loginAsMember(page);

    const res = await page.request.get("/api/library/pieces");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      items: Array<{ id: string; title: string }>;
      my_voice: string | null;
    };
    expect(body.my_voice).toBeTruthy();
    // Without attached visible files, piece is not listed for members
    expect(body.items.some((item) => item.id === piece.id)).toBe(false);
  });

  test("guest cannot open library pages", async ({ page }) => {
    await page.goto("/library/scores", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await page.goto("/library/audio", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
