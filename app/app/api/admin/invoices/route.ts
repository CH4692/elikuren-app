import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/authz";
import {
  createInvoice,
  DOCUMENT_TYPES,
  listInvoices,
  serializeInvoice,
} from "@/lib/invoices";
import type { InvoiceDocumentType } from "@/lib/generated/prisma/client";

export async function GET(request: Request) {
  const gate = await requirePermission("INVOICE_READ");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const items = await listInvoices(q);

  return NextResponse.json({
    items: items.map(serializeInvoice),
  });
}

export async function POST(request: Request) {
  const gate = await requirePermission("INVOICE_WRITE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as {
    invoice_number?: string;
    document_type?: InvoiceDocumentType;
    recipient_name?: string;
    recipient_email?: string | null;
    recipient_address?: string | null;
    supplier_name?: string | null;
    description?: string | null;
    category?: string | null;
    amount_cents?: number;
    tax_amount_cents?: number;
    currency?: string;
    issue_date?: string;
    due_date?: string | null;
    status?: string;
    note?: string | null;
    stored_file_id?: string | null;
    member_id?: string | null;
  };

  const invoiceNumber = String(body.invoice_number ?? "").trim();
  const recipientName = String(body.recipient_name ?? "").trim();
  const issueDate = body.issue_date;
  const amountCents = Number(body.amount_cents);

  if (!invoiceNumber || !recipientName || !issueDate || !Number.isFinite(amountCents)) {
    return NextResponse.json(
      {
        detail: "Rechnungsnummer, Empfänger, Datum und Betrag sind Pflicht",
        code: "validation_error",
      },
      { status: 400 },
    );
  }

  const documentType = body.document_type ?? "INVOICE";
  if (!DOCUMENT_TYPES.includes(documentType)) {
    return NextResponse.json(
      { detail: "Ungültiger Belegtyp", code: "validation_error" },
      { status: 400 },
    );
  }

  const invoice = await createInvoice(
    {
      invoiceNumber,
      documentType,
      recipientName,
      recipientEmail: body.recipient_email,
      recipientAddress: body.recipient_address,
      supplierName: body.supplier_name,
      description: body.description,
      category: body.category,
      amountCents,
      taxAmountCents: body.tax_amount_cents,
      currency: body.currency,
      issueDate,
      dueDate: body.due_date,
      status: body.status as Parameters<typeof createInvoice>[0]["status"],
      note: body.note,
      storedFileId: body.stored_file_id,
      memberId: body.member_id,
    },
    gate.user.id,
  );

  await writeAuditLog({
    action: "invoice.created",
    entityType: "invoice",
    entityId: invoice.id,
    actorUserId: gate.user.id,
    metadata: {
      invoiceNumber,
      amountCents,
    },
  });

  return NextResponse.json(serializeInvoice(invoice), { status: 201 });
}
