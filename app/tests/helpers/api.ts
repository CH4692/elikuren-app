import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Use the browser context cookies after UI login. */
export function authedRequest(page: Page): APIRequestContext {
  return page.request;
}

export async function createInvoice(
  request: APIRequestContext,
  input?: { invoiceNumber?: string; amountCents?: number },
) {
  const res = await request.post("/api/admin/invoices", {
    data: {
      invoice_number: input?.invoiceNumber ?? `E2E-${Date.now()}`,
      document_type: "INVOICE",
      recipient_name: "Kammerchor Elikuren",
      amount_cents: input?.amountCents ?? 1250,
      issue_date: new Date().toISOString().slice(0, 10),
      status: "OPEN",
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ id: string; invoice_number: string }>;
}
