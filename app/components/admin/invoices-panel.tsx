"use client";

import { CheckCircle2, ExternalLink, FileText, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminEditButton } from "@/components/admin/admin-edit-button";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { FormDrawer } from "@/components/app/form-drawer";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCents, parseEurosToCents } from "@/lib/money";
import { uploadFileViaPresign } from "@/lib/upload-client";

type InvoiceItem = {
  id: string;
  invoice_number: string;
  document_type: string;
  recipient_name: string;
  supplier_name: string | null;
  description: string | null;
  amount_cents: number;
  currency: string;
  issue_date: string;
  due_date: string | null;
  status: string;
  note: string | null;
  paid_at: string | null;
  payment_method: string | null;
  stored_file: { id: string; original_name: string } | null;
};

type Props = {
  canWrite: boolean;
  canRecordPayment: boolean;
};

type InvoiceForm = {
  invoice_number: string;
  document_type: string;
  recipient_name: string;
  supplier_name: string;
  description: string;
  amount: string;
  issue_date: string;
  due_date: string;
  status: string;
  note: string;
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Entwurf",
  OPEN: "Offen",
  PAID: "Bezahlt",
  OVERDUE: "Überfällig",
  CANCELLED: "Storniert",
};

const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

function centsToEuroInput(cents: number): string {
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  const sign = cents < 0 ? "-" : "";
  return `${sign}${whole},${frac}`;
}

const emptyForm = (): InvoiceForm => ({
  invoice_number: "",
  document_type: "INVOICE",
  recipient_name: "",
  supplier_name: "",
  description: "",
  amount: "",
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: "",
  status: "DRAFT",
  note: "",
});

function formFromItem(item: InvoiceItem): InvoiceForm {
  return {
    invoice_number: item.invoice_number,
    document_type: item.document_type,
    recipient_name: item.recipient_name,
    supplier_name: item.supplier_name ?? "",
    description: item.description ?? "",
    amount: centsToEuroInput(item.amount_cents),
    issue_date: item.issue_date,
    due_date: item.due_date ?? "",
    status: item.status,
    note: item.note ?? "",
  };
}

function statusBadge(status: string) {
  if (status === "PAID") return <Badge variant="success">Bezahlt</Badge>;
  if (status === "OVERDUE") return <Badge variant="danger">Überfällig</Badge>;
  if (status === "OPEN") return <Badge variant="warning">Offen</Badge>;
  return <Badge variant="default">{STATUS_LABELS[status] ?? status}</Badge>;
}

export function InvoicesPanel({ canWrite, canRecordPayment }: Props) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InvoiceItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<InvoiceItem | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<InvoiceForm>(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [payTarget, setPayTarget] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/invoices${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: InvoiceItem[] };
      setItems(data.items);
    } catch {
      toast.error("Belege konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setForm(emptyForm());
    setFile(null);
    setCreateOpen(true);
  }

  function openEdit(item: InvoiceItem) {
    setForm(formFromItem(item));
    setFile(null);
    setEditTarget(item);
  }

  async function openStoredFile(fileId: string) {
    try {
      const res = await fetch(`/api/files/${fileId}/url?disposition=inline`);
      if (!res.ok) throw new Error("url failed");
      const data = (await res.json()) as { url: string };
      if (!data.url) throw new Error("url missing");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Datei konnte nicht geöffnet werden");
    }
  }

  function createInvoice() {
    const amountCents = parseEurosToCents(form.amount);
    if (amountCents == null) {
      toast.error("Ungültiger Betrag");
      return;
    }
    if (!form.invoice_number.trim() || !form.recipient_name.trim()) {
      toast.error("Rechnungsnummer und Empfänger sind Pflicht");
      return;
    }

    startTransition(async () => {
      try {
        let storedFileId: string | null = null;
        if (file) {
          const uploaded = await uploadFileViaPresign({
            file,
            category: "INVOICE",
          });
          storedFileId = uploaded.fileId;
        }

        const res = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice_number: form.invoice_number,
            document_type: form.document_type,
            recipient_name: form.recipient_name,
            supplier_name: form.supplier_name || null,
            description: form.description || null,
            amount_cents: amountCents,
            issue_date: form.issue_date,
            due_date: form.due_date || null,
            status: form.status,
            note: form.note || null,
            stored_file_id: storedFileId,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          toast.error(err.detail ?? "Beleg konnte nicht angelegt werden");
          return;
        }
        toast.success("Beleg angelegt");
        setCreateOpen(false);
        setFile(null);
        setForm(emptyForm());
        await load(search || undefined);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler beim Anlegen");
      }
    });
  }

  function saveEdit() {
    if (!editTarget) return;
    const amountCents = parseEurosToCents(form.amount);
    if (amountCents == null) {
      toast.error("Ungültiger Betrag");
      return;
    }
    if (!form.recipient_name.trim()) {
      toast.error("Empfänger ist Pflicht");
      return;
    }

    startTransition(async () => {
      try {
        let storedFileId: string | undefined;
        if (file) {
          const uploaded = await uploadFileViaPresign({
            file,
            category: "INVOICE",
          });
          storedFileId = uploaded.fileId;
        }

        const res = await fetch(`/api/admin/invoices/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document_type: form.document_type,
            recipient_name: form.recipient_name,
            supplier_name: form.supplier_name || null,
            description: form.description || null,
            amount_cents: amountCents,
            issue_date: form.issue_date,
            due_date: form.due_date || null,
            status: form.status,
            note: form.note || null,
            ...(storedFileId ? { stored_file_id: storedFileId } : {}),
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          toast.error(err.detail ?? "Speichern fehlgeschlagen");
          return;
        }
        toast.success("Gespeichert");
        setEditTarget(null);
        setFile(null);
        await load(search || undefined);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler beim Speichern");
      }
    });
  }

  function confirmMarkPaid() {
    if (!payTarget) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/invoices/${payTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PAID",
          payment_method: paymentMethod.trim() || null,
        }),
      });
      if (!res.ok) {
        toast.error("Zahlung konnte nicht erfasst werden");
        return;
      }
      toast.success("Als bezahlt markiert");
      setPayTarget(null);
      setPaymentMethod("");
      await load(search || undefined);
    });
  }

  return (
    <div>
      <PageHeader
        title="Rechnungen & Belege"
        description={
          canWrite
            ? "Belege erfassen, bearbeiten und Zahlungen dokumentieren."
            : "Lesezugriff auf Belege und Zahlungsstatus."
        }
        actions={
          canWrite ? (
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" />
              Neuer Beleg
            </Button>
          ) : null
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Suche…"
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-[#d9d2c4]"
            onClick={() => void load(search || undefined)}
          >
            Suchen
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Keine Belege"
          description="Es wurden noch keine Rechnungen oder Belege erfasst."
          action={
            canWrite ? (
              <Button type="button" onClick={openCreate}>
                Neuer Beleg
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nr.</TableHead>
                <TableHead>Empfänger</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datei</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.invoice_number}
                  </TableCell>
                  <TableCell>{item.recipient_name}</TableCell>
                  <TableCell>
                    {formatCents(item.amount_cents, item.currency)}
                  </TableCell>
                  <TableCell>
                    {item.issue_date}
                    {item.due_date ? (
                      <span className="block text-xs text-[#5c574e]">
                        fällig {item.due_date}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.stored_file ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4]"
                        onClick={() => void openStoredFile(item.stored_file!.id)}
                        aria-label={`Datei öffnen: ${item.stored_file.original_name}`}
                      >
                        <ExternalLink className="size-3.5" />
                        Öffnen
                      </Button>
                    ) : (
                      <span className="text-xs text-[#8a8478]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                      {canRecordPayment && item.status !== "PAID" ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => {
                            setPayTarget(item);
                            setPaymentMethod("");
                          }}
                        >
                          <CheckCircle2 className="size-3.5" />
                          Bezahlt
                        </Button>
                      ) : null}
                      {canWrite ? (
                        <>
                          <AdminEditButton onClick={() => openEdit(item)} />
                          <AdminDeleteButton
                            iconOnly
                            label="Archivieren"
                            onClick={() => setArchiveTarget(item)}
                          />
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canWrite ? (
        <>
          <FormDrawer
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) {
                setForm(emptyForm());
                setFile(null);
              }
            }}
            title="Neuer Beleg"
            loading={pending}
            onSubmit={createInvoice}
            submitLabel="Anlegen"
          >
            <InvoiceFormFields
              form={form}
              onChange={setForm}
              file={file}
              onFileChange={setFile}
              numberEditable
            />
          </FormDrawer>

          <FormDrawer
            open={editTarget != null}
            onOpenChange={(open) => {
              if (!open) {
                setEditTarget(null);
                setFile(null);
              }
            }}
            title="Beleg bearbeiten"
            description={
              editTarget
                ? `${editTarget.invoice_number} · ${formatCents(editTarget.amount_cents, editTarget.currency)}`
                : undefined
            }
            loading={pending}
            onSubmit={saveEdit}
            submitLabel="Speichern"
          >
            <InvoiceFormFields
              form={form}
              onChange={setForm}
              file={file}
              onFileChange={setFile}
              numberEditable={false}
              existingFileName={editTarget?.stored_file?.original_name ?? null}
            />
          </FormDrawer>
        </>
      ) : null}

      <FormDrawer
        open={payTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setPayTarget(null);
            setPaymentMethod("");
          }
        }}
        title="Als bezahlt markieren"
        description={
          payTarget
            ? `${payTarget.invoice_number} · ${formatCents(payTarget.amount_cents, payTarget.currency)}`
            : undefined
        }
        loading={pending}
        onSubmit={confirmMarkPaid}
        submitLabel="Als bezahlt markieren"
      >
        <div>
          <Label htmlFor="pay-method">Zahlungsmethode (optional)</Label>
          <Input
            id="pay-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="z. B. Überweisung"
          />
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={archiveTarget != null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="Beleg archivieren?"
        description={
          archiveTarget
            ? `„${archiveTarget.invoice_number}“ (${archiveTarget.recipient_name}) wird aus der Liste entfernt.`
            : undefined
        }
        confirmLabel="Archivieren"
        destructive
        loading={pending}
        onConfirm={() => {
          if (!archiveTarget) return;
          startTransition(async () => {
            const res = await fetch(
              `/api/admin/invoices/${archiveTarget.id}`,
              { method: "DELETE" },
            );
            if (!res.ok) {
              toast.error("Archivieren fehlgeschlagen");
              return;
            }
            toast.success("Archiviert");
            setArchiveTarget(null);
            if (editTarget?.id === archiveTarget.id) {
              setEditTarget(null);
            }
            await load(search || undefined);
          });
        }}
      />
    </div>
  );
}

function InvoiceFormFields({
  form,
  onChange,
  file,
  onFileChange,
  numberEditable,
  existingFileName,
}: {
  form: InvoiceForm;
  onChange: (form: InvoiceForm) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  numberEditable: boolean;
  existingFileName?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="inv-num">Rechnungsnummer</Label>
          <Input
            id="inv-num"
            value={form.invoice_number}
            disabled={!numberEditable}
            onChange={(e) =>
              onChange({ ...form, invoice_number: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="inv-type">Typ</Label>
          <select
            id="inv-type"
            className={selectClass}
            value={form.document_type}
            onChange={(e) =>
              onChange({ ...form, document_type: e.target.value })
            }
          >
            <option value="INVOICE">Rechnung</option>
            <option value="RECEIPT">Quittung</option>
            <option value="EXPENSE">Ausgabe</option>
            <option value="INCOME">Einnahme</option>
            <option value="CREDIT_NOTE">Gutschrift</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="inv-recipient">Empfänger</Label>
          <Input
            id="inv-recipient"
            value={form.recipient_name}
            onChange={(e) =>
              onChange({ ...form, recipient_name: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="inv-supplier">Lieferant (optional)</Label>
          <Input
            id="inv-supplier"
            value={form.supplier_name}
            onChange={(e) =>
              onChange({ ...form, supplier_name: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="inv-amount">Betrag (EUR)</Label>
          <Input
            id="inv-amount"
            placeholder="12,50"
            value={form.amount}
            onChange={(e) => onChange({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="inv-issue">Datum</Label>
          <Input
            id="inv-issue"
            type="date"
            value={form.issue_date}
            onChange={(e) =>
              onChange({ ...form, issue_date: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="inv-due">Fällig (optional)</Label>
          <Input
            id="inv-due"
            type="date"
            value={form.due_date}
            onChange={(e) => onChange({ ...form, due_date: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="inv-status">Status</Label>
        <select
          id="inv-status"
          className={selectClass}
          value={form.status}
          onChange={(e) => onChange({ ...form, status: e.target.value })}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="inv-desc">Beschreibung</Label>
        <Textarea
          id="inv-desc"
          rows={2}
          value={form.description}
          onChange={(e) =>
            onChange({ ...form, description: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="inv-note">Notiz (optional)</Label>
        <Textarea
          id="inv-note"
          rows={2}
          value={form.note}
          onChange={(e) => onChange({ ...form, note: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="inv-file">
          {existingFileName
            ? "Anhang ersetzen (PDF/Bild, optional)"
            : "Anhang (PDF/Bild, optional)"}
        </Label>
        {existingFileName && !file ? (
          <p className="mb-2 text-xs text-[#5c574e]">
            Aktuell: {existingFileName}
          </p>
        ) : null}
        <Input
          id="inv-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
