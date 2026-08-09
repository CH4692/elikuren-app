import { config as loadEnv } from "dotenv";
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import pg from "pg";

import { pgSslForConnectionString } from "../../lib/pg-connection";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", quiet: true });

/** Use the browser context cookies after UI login. */
export function authedRequest(page: Page): APIRequestContext {
  return page.request;
}

export async function createInvoice(
  request: APIRequestContext,
  input?: {
    invoiceNumber?: string;
    amountCents?: number;
    withStoredFile?: boolean;
  },
) {
  let storedFileId: string | undefined;
  if (input?.withStoredFile) {
    storedFileId = await createReadyInvoiceFile();
  }

  const res = await request.post("/api/admin/invoices", {
    data: {
      invoice_number: input?.invoiceNumber ?? `E2E-${Date.now()}`,
      document_type: "INVOICE",
      recipient_name: "Kammerchor Elikuren",
      amount_cents: input?.amountCents ?? 1250,
      issue_date: new Date().toISOString().slice(0, 10),
      status: "OPEN",
      ...(storedFileId ? { stored_file_id: storedFileId } : {}),
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{
    id: string;
    invoice_number: string;
    stored_file: { id: string; original_name: string } | null;
  }>;
}

/**
 * Insert a READY invoice StoredFile for UI download-button tests (no R2 upload).
 * Uses raw pg so Playwright workers never import the Prisma ESM client.
 */
async function createReadyInvoiceFile(): Promise<string> {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required for invoice file fixture");

  const pool = new pg.Pool({
    connectionString: url,
    ssl: pgSslForConnectionString(url),
  });
  try {
    const id = randomUUID();
    const objectKey = `finance/invoices/test/${id}.pdf`;
    const originalName = `beleg-${id.slice(0, 8)}.pdf`;
    await pool.query(
      `INSERT INTO stored_files (
         id, object_key, original_name, mime_type, size_bytes,
         category, visibility, upload_status, created_at, updated_at
       ) VALUES (
         $1, $2, $3, 'application/pdf', 1024,
         'INVOICE', 'MEMBERS', 'READY', NOW(), NOW()
       )`,
      [id, objectKey, originalName],
    );
    return id;
  } finally {
    await pool.end();
  }
}
