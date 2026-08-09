import type {
  Invoice,
  InvoiceDocumentType,
  InvoiceStatus,
  Prisma,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

type InvoiceWithRelations = Invoice & {
  storedFile?: { id: string; originalName: string } | null;
  member?: { id: string; firstname: string | null; lastname: string | null } | null;
  createdBy?: { id: string; firstname: string | null; lastname: string | null } | null;
};

export function serializeInvoice(invoice: InvoiceWithRelations) {
  return {
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    document_type: invoice.documentType,
    recipient_name: invoice.recipientName,
    recipient_email: invoice.recipientEmail,
    recipient_address: invoice.recipientAddress,
    supplier_name: invoice.supplierName,
    description: invoice.description,
    category: invoice.category,
    amount_cents: invoice.amountCents,
    tax_amount_cents: invoice.taxAmountCents,
    currency: invoice.currency,
    issue_date: invoice.issueDate.toISOString().slice(0, 10),
    due_date: invoice.dueDate?.toISOString().slice(0, 10) ?? null,
    paid_at: invoice.paidAt?.toISOString() ?? null,
    payment_method: invoice.paymentMethod,
    status: invoice.status,
    note: invoice.note,
    stored_file_id: invoice.storedFileId,
    stored_file: invoice.storedFile
      ? {
          id: invoice.storedFile.id,
          original_name: invoice.storedFile.originalName,
        }
      : null,
    member_id: invoice.memberId,
    member: invoice.member
      ? {
          id: invoice.member.id,
          firstname: invoice.member.firstname,
          lastname: invoice.member.lastname,
        }
      : null,
    created_by: invoice.createdBy
      ? {
          id: invoice.createdBy.id,
          firstname: invoice.createdBy.firstname,
          lastname: invoice.createdBy.lastname,
        }
      : null,
    created_at: invoice.createdAt.toISOString(),
    updated_at: invoice.updatedAt.toISOString(),
  };
}

const invoiceInclude = {
  storedFile: { select: { id: true, originalName: true } },
  member: { select: { id: true, firstname: true, lastname: true } },
  createdBy: { select: { id: true, firstname: true, lastname: true } },
} satisfies Prisma.InvoiceInclude;

export async function listInvoices(q?: string) {
  const where: Prisma.InvoiceWhereInput = { archivedAt: null };
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { invoiceNumber: { contains: term, mode: "insensitive" } },
      { recipientName: { contains: term, mode: "insensitive" } },
      { supplierName: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  return prisma.invoice.findMany({
    where,
    orderBy: { issueDate: "desc" },
    include: invoiceInclude,
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });
}

export type InvoiceCreateInput = {
  invoiceNumber: string;
  documentType: InvoiceDocumentType;
  recipientName: string;
  recipientEmail?: string | null;
  recipientAddress?: string | null;
  supplierName?: string | null;
  description?: string | null;
  category?: string | null;
  amountCents: number;
  taxAmountCents?: number;
  currency?: string;
  issueDate: string;
  dueDate?: string | null;
  status?: InvoiceStatus;
  note?: string | null;
  storedFileId?: string | null;
  memberId?: string | null;
};

export async function createInvoice(
  data: InvoiceCreateInput,
  createdById: string,
) {
  return prisma.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber.trim(),
      documentType: data.documentType,
      recipientName: data.recipientName.trim(),
      recipientEmail: data.recipientEmail?.trim() || null,
      recipientAddress: data.recipientAddress?.trim() || null,
      supplierName: data.supplierName?.trim() || null,
      description: data.description?.trim() || null,
      category: data.category?.trim() || null,
      amountCents: data.amountCents,
      taxAmountCents: data.taxAmountCents ?? 0,
      currency: data.currency ?? "EUR",
      issueDate: new Date(data.issueDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status ?? "DRAFT",
      note: data.note?.trim() || null,
      storedFileId: data.storedFileId || null,
      memberId: data.memberId || null,
      createdById,
    },
    include: invoiceInclude,
  });
}

export type InvoicePatchBody = Partial<
  Omit<InvoiceCreateInput, "invoiceNumber">
> & {
  paidAt?: string | null;
  paymentMethod?: string | null;
  status?: InvoiceStatus;
};

export async function updateInvoice(id: string, data: InvoicePatchBody) {
  const patch: Prisma.InvoiceUpdateInput = {};
  if ("documentType" in data && data.documentType != null)
    patch.documentType = data.documentType;
  if ("recipientName" in data && data.recipientName != null)
    patch.recipientName = data.recipientName.trim();
  if ("recipientEmail" in data)
    patch.recipientEmail = data.recipientEmail?.trim() || null;
  if ("recipientAddress" in data)
    patch.recipientAddress = data.recipientAddress?.trim() || null;
  if ("supplierName" in data)
    patch.supplierName = data.supplierName?.trim() || null;
  if ("description" in data) patch.description = data.description?.trim() || null;
  if ("category" in data) patch.category = data.category?.trim() || null;
  if ("amountCents" in data && data.amountCents != null)
    patch.amountCents = data.amountCents;
  if ("taxAmountCents" in data && data.taxAmountCents != null)
    patch.taxAmountCents = data.taxAmountCents;
  if ("currency" in data && data.currency != null) patch.currency = data.currency;
  if ("issueDate" in data && data.issueDate != null)
    patch.issueDate = new Date(data.issueDate);
  if ("dueDate" in data)
    patch.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if ("note" in data) patch.note = data.note?.trim() || null;
  if ("storedFileId" in data) {
    const storedFileId = data.storedFileId;
    patch.storedFile = storedFileId
      ? { connect: { id: storedFileId } }
      : { disconnect: true };
  }
  if ("memberId" in data) {
    const memberId = data.memberId;
    patch.member = memberId ? { connect: { id: memberId } } : { disconnect: true };
  }
  if ("status" in data && data.status != null) patch.status = data.status;
  if ("paidAt" in data)
    patch.paidAt = data.paidAt ? new Date(data.paidAt) : null;
  if ("paymentMethod" in data)
    patch.paymentMethod = data.paymentMethod?.trim() || null;

  return prisma.invoice.update({
    where: { id },
    data: patch,
    include: invoiceInclude,
  });
}

/** Soft-archive. Returns null if missing or already archived. */
export async function archiveInvoice(id: string) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing || existing.archivedAt) return null;

  return prisma.invoice.update({
    where: { id },
    data: { archivedAt: new Date() },
    include: invoiceInclude,
  });
}

export const DOCUMENT_TYPES: InvoiceDocumentType[] = [
  "INCOME",
  "EXPENSE",
  "INVOICE",
  "RECEIPT",
  "CREDIT_NOTE",
];

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "OPEN",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];
