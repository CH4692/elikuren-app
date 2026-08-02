import { test, expect } from "@playwright/test";

import { createInvoice } from "../helpers/api";
import { loginAsAdmin, loginAsAuditor, loginAsMember } from "../helpers/auth";

test.describe("Library API integration", () => {
  test("member can list flat scores and audio", async ({ page }) => {
    await loginAsMember(page);

    const scoresRes = await page.request.get("/api/library/scores");
    expect(scoresRes.ok()).toBeTruthy();
    const scoresBody = (await scoresRes.json()) as { items: unknown[] };
    expect(Array.isArray(scoresBody.items)).toBe(true);

    const audioRes = await page.request.get("/api/library/audio");
    expect(audioRes.ok()).toBeTruthy();
    const audioBody = (await audioRes.json()) as { items: unknown[] };
    expect(Array.isArray(audioBody.items)).toBe(true);
  });
});

test.describe("Invoices API integration", () => {
  test("auditor can read invoices but member cannot", async ({ page }) => {
    await loginAsAdmin(page);
    const invoiceNumber = `INT-${Date.now()}`;
    await createInvoice(page.request, { invoiceNumber });

    await page.context().clearCookies();
    await loginAsAuditor(page);
    expect((await page.request.get("/api/admin/invoices")).ok()).toBeTruthy();

    await page.context().clearCookies();
    await loginAsMember(page);
    expect((await page.request.get("/api/admin/invoices")).status()).toBe(403);
  });
});
