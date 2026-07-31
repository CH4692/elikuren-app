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

export async function publishPiece(request: APIRequestContext, id: string) {
  const res = await request.patch(`/api/admin/pieces/${id}`, {
    data: { publicationStatus: "PUBLISHED", rehearsalStatus: "REHEARSING" },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function createEvent(
  request: APIRequestContext,
  input?: { title?: string; startsAt?: string },
) {
  const startsAt =
    input?.startsAt ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const res = await request.post("/api/admin/events", {
    data: {
      title: input?.title ?? `E2E Termin ${Date.now()}`,
      type: "REHEARSAL",
      starts_at: startsAt,
      location: "Probenraum",
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ id: string; title: string }>;
}

export async function createAnnouncement(
  request: APIRequestContext,
  input?: { title?: string; body?: string; publish?: boolean },
) {
  const res = await request.post("/api/admin/announcements", {
    data: {
      title: input?.title ?? `E2E Mitteilung ${Date.now()}`,
      body: input?.body ?? "Playwright Mitteilungstext",
      is_important: true,
      publish: input?.publish ?? true,
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ id: string; title: string }>;
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
