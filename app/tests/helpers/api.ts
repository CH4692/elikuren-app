import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Use the browser context cookies after UI login. */
export function authedRequest(page: Page): APIRequestContext {
  return page.request;
}

export async function createPiece(
  request: APIRequestContext,
  input?: { title?: string; composer?: string },
) {
  const title = input?.title ?? `E2E Piece ${Date.now()}`;
  const composer = input?.composer ?? "E2E Composer";
  const res = await request.post("/api/admin/pieces", {
    data: { title, composer },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ id: string; title: string }>;
}

/** Mark piece as currently in rehearsal (dashboard “aktuelles Projekt”). */
export async function setPieceRehearsing(
  request: APIRequestContext,
  id: string,
) {
  const res = await request.patch(`/api/admin/pieces/${id}`, {
    data: { rehearsalStatus: "REHEARSING" },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
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
