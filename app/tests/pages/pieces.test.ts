import { test, expect } from "@playwright/test";

import { createPiece, publishPiece } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Admin Stücke", () => {
  test("create draft piece via UI and publish", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/pieces", { waitUntil: "domcontentloaded" });

    const title = `UI Stück ${Date.now()}`;
    await page.locator("#piece-title").fill(title);
    await page.locator("#piece-composer").fill("Bach");
    await page.getByRole("button", { name: "Entwurf anlegen" }).click();

    await expect(page).toHaveURL(/\/admin\/pieces\//, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Entwurf").first()).toBeVisible();

    await page.getByRole("button", { name: "Stück veröffentlichen" }).click();
    await expect(page.getByText("Veröffentlicht").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("member cannot open pieces admin", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/pieces", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/admin\/pieces$/);
  });

  test("published piece appears in library for members", async ({ page }) => {
    await loginAsAdmin(page);
    const title = `Lib Stück ${Date.now()}`;
    const piece = await createPiece(page.request, { title, composer: "Mozart" });
    await publishPiece(page.request, piece.id);

    await page.context().clearCookies();
    await loginAsMember(page);
    await page.goto(`/library/pieces/${piece.id}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Mozart")).toBeVisible();
  });

  test("draft piece is hidden from member library detail", async ({ page }) => {
    await loginAsAdmin(page);
    const piece = await createPiece(page.request, {
      title: `Draft ${Date.now()}`,
    });

    await page.context().clearCookies();
    await loginAsMember(page);
    const res = await page.request.get(`/api/library/pieces/${piece.id}`);
    expect(res.status()).toBe(404);
  });
});
