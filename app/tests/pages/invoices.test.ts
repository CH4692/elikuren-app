import { test, expect } from "@playwright/test";

import { createInvoice } from "../helpers/api";
import { loginAsAdmin, loginAsAuditor, loginAsMember } from "../helpers/auth";

test.describe("Rechnungen", () => {
  test("admin can create invoice via UI", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/invoices", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Rechnungen/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Neuer Beleg" }).click();
    const number = `UI-${Date.now()}`;
    await page.locator("#inv-num").fill(number);
    await page.locator("#inv-recipient").fill("Test Empfänger");
    await page.locator("#inv-amount").fill("12,50");
    await page.locator("#inv-status").selectOption("OPEN");
    await page.locator("#inv-note").fill("UI-Notiz");
    await page.getByRole("button", { name: "Anlegen" }).click();
    await expect(page.getByText(number)).toBeVisible({ timeout: 10_000 });
  });

  test("admin can edit invoice via UI", async ({ page }) => {
    await loginAsAdmin(page);
    const invoice = await createInvoice(page.request, {
      invoiceNumber: `EDIT-${Date.now()}`,
    });
    await page.goto("/admin/invoices", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(invoice.invoice_number)).toBeVisible({
      timeout: 10_000,
    });

    const row = page.locator("tr", {
      has: page.getByText(invoice.invoice_number, { exact: true }),
    });
    await row.getByRole("button", { name: /Bearbeiten/i }).click();
    await expect(
      page.getByRole("heading", { name: /Beleg bearbeiten/i }),
    ).toBeVisible();

    const newRecipient = `Empfänger ${Date.now()}`;
    await page.locator("#inv-recipient").fill(newRecipient);
    await page.locator("#inv-status").selectOption("OPEN");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText(newRecipient)).toBeVisible({ timeout: 10_000 });
  });

  test("admin can archive invoice via UI", async ({ page }) => {
    await loginAsAdmin(page);
    const invoice = await createInvoice(page.request, {
      invoiceNumber: `ARCH-${Date.now()}`,
    });
    await page.goto("/admin/invoices", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(invoice.invoice_number)).toBeVisible({
      timeout: 10_000,
    });

    const row = page.locator("tr", {
      has: page.getByText(invoice.invoice_number, { exact: true }),
    });
    await row.getByRole("button", { name: /Archivieren/i }).click();
    await page.getByRole("button", { name: "Archivieren" }).last().click();
    await expect(page.getByText(invoice.invoice_number)).toHaveCount(0, {
      timeout: 10_000,
    });

    const getRes = await page.request.get(
      `/api/admin/invoices/${invoice.id}`,
    );
    expect(getRes.status()).toBe(404);
  });

  test("admin can mark invoice paid via API", async ({ page }) => {
    await loginAsAdmin(page);
    const invoice = await createInvoice(page.request);
    const res = await page.request.patch(`/api/admin/invoices/${invoice.id}`, {
      data: { status: "PAID", payment_method: "Überweisung" },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("PAID");
  });

  test("admin sees file open button when attachment exists", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const invoice = await createInvoice(page.request, {
      invoiceNumber: `FILE-${Date.now()}`,
      withStoredFile: true,
    });
    expect(invoice.stored_file?.id).toBeTruthy();

    await page.goto("/admin/invoices", { waitUntil: "domcontentloaded" });
    const row = page.locator("tr", {
      has: page.getByText(invoice.invoice_number, { exact: true }),
    });
    await expect(row.getByRole("button", { name: /Öffnen/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("kassenpruefer has read-only invoices UI", async ({ page }) => {
    await loginAsAuditor(page);
    await page.goto("/admin/invoices", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Rechnungen/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Neuer Beleg" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("button", { name: /Bearbeiten/i })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: /Archivieren/i }),
    ).toHaveCount(0);

    const write = await page.request.post("/api/admin/invoices", {
      data: {
        invoice_number: `RO-${Date.now()}`,
        document_type: "INVOICE",
        recipient_name: "X",
        amount_cents: 100,
        issue_date: new Date().toISOString().slice(0, 10),
      },
    });
    expect(write.status()).toBe(403);

    const del = await page.request.delete("/api/admin/invoices/nonexistent");
    expect(del.status()).toBe(403);
  });

  test("member has no invoice access", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/admin/invoices", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/admin\/invoices$/);

    const res = await page.request.get("/api/admin/invoices");
    expect(res.status()).toBe(403);
  });
});
