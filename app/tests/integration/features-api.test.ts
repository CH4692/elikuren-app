import { test, expect } from "@playwright/test";

import { createInvoice, createPiece, publishPiece } from "../helpers/api";
import { loginAsAdmin, loginAsAuditor, loginAsMember } from "../helpers/auth";

test.describe("Library API integration", () => {
  test("published piece appears in member library list", async ({ page }) => {
    await loginAsAdmin(page);
    const piece = await createPiece(page.request, {
      title: `Int Library ${Date.now()}`,
    });
    await publishPiece(page.request, piece.id);

    await page.context().clearCookies();
    await loginAsMember(page);
    const res = await page.request.get("/api/library/pieces");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { items: Array<{ id: string; title: string }> };
    expect(body.items.some((item) => item.id === piece.id)).toBeTruthy();
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
