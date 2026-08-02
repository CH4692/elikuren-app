import { NextResponse } from "next/server";

import { requireActiveSession, requirePermission } from "@/lib/authz";
import { hasPermission } from "@/lib/permissions";
import {
  getInvoiceById,
  INVOICE_STATUSES,
  serializeInvoice,
  updateInvoice,
} from "@/lib/invoices";
import type { InvoiceStatus } from "@/lib/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requirePermission("INVOICE_READ");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json(
      { detail: "Beleg nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  return NextResponse.json(serializeInvoice(invoice));
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireActiveSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json(
      { detail: "Beleg nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    document_type?: string;
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
    note?: string | null;
    stored_file_id?: string | null;
    member_id?: string | null;
    status?: InvoiceStatus;
    paid_at?: string | null;
    payment_method?: string | null;
  };

  const wantsPayment =
    ("status" in body && body.status === "PAID") ||
    "paid_at" in body ||
    "payment_method" in body;

  const wantsWrite =
    wantsPayment ||
    "document_type" in body ||
    "recipient_name" in body ||
    "recipient_email" in body ||
    "recipient_address" in body ||
    "supplier_name" in body ||
    "description" in body ||
    "category" in body ||
    "amount_cents" in body ||
    "tax_amount_cents" in body ||
    "currency" in body ||
    "issue_date" in body ||
    "due_date" in body ||
    "note" in body ||
    "stored_file_id" in body ||
    "member_id" in body ||
    ("status" in body && body.status !== "PAID");

  if (!wantsWrite) {
    return NextResponse.json(
      { detail: "Keine Änderungen", code: "validation_error" },
      { status: 400 },
    );
  }

  if (wantsPayment) {
    if (!hasPermission(session.user.role, "PAYMENT_RECORD")) {
      return NextResponse.json(
        { detail: "Forbidden", code: "http_403" },
        { status: 403 },
      );
    }
  } else if (!hasPermission(session.user.role, "INVOICE_WRITE")) {
    return NextResponse.json(
      { detail: "Forbidden", code: "http_403" },
      { status: 403 },
    );
  }

  if (body.status && !INVOICE_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { detail: "Ungültiger Status", code: "validation_error" },
      { status: 400 },
    );
  }

  const updated = await updateInvoice(id, {
    documentType: body.document_type as Parameters<typeof updateInvoice>[1]["documentType"],
    recipientName: body.recipient_name,
    recipientEmail: body.recipient_email,
    recipientAddress: body.recipient_address,
    supplierName: body.supplier_name,
    description: body.description,
    category: body.category,
    amountCents: body.amount_cents,
    taxAmountCents: body.tax_amount_cents,
    currency: body.currency,
    issueDate: body.issue_date,
    dueDate: body.due_date,
    note: body.note,
    storedFileId: body.stored_file_id,
    memberId: body.member_id,
    status: body.status,
    paidAt:
      body.status === "PAID" && !body.paid_at
        ? new Date().toISOString()
        : body.paid_at,
    paymentMethod: body.payment_method,
  });

  return NextResponse.json(serializeInvoice(updated));
}
