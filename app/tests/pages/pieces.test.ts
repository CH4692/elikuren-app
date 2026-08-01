import { test, expect } from "@playwright/test";

import { createPiece } from "../helpers/api";
import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Admin Stücke", () => {
  test("pieces admin shows upload-first UI", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/pieces", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Stücke", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Datei hochladen|Hochladen/i }),
    ).toBeVisible();
  });

  test("member cannot open pieces admin", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/pieces", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("piece with no files is hidden from member library detail", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const piece = await createPiece(page.request, {
      title: `Empty ${Date.now()}`,
    });

    await page.context().clearCookies();
    await loginAsMember(page);
    const res = await page.request.get(`/api/library/pieces/${piece.id}`);
    expect(res.status()).toBe(404);
  });

  test("piece appears in library list once created (admin sees empty piece)", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const title = `Lib Stück ${Date.now()}`;
    const piece = await createPiece(page.request, {
      title,
      composer: "Mozart",
    });

    const adminRes = await page.request.get(`/api/admin/pieces/${piece.id}`);
    expect(adminRes.ok()).toBeTruthy();
    const body = (await adminRes.json()) as { title: string };
    expect(body.title).toBe(title);
  });
});
