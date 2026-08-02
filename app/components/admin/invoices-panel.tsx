"use client";

import { CheckCircle2, FileText, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  function createInvoice() {
    const amountCents = parseEurosToCents(form.amount);
    if (amountCents == null) {
      toast.error("Ungültiger Betrag");
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
          toast.error("Beleg konnte nicht angelegt werden");
          return;
        }
        toast.success("Beleg angelegt");
        setDrawerOpen(false);
        setFile(null);
        setForm(emptyForm());
        await load(search || undefined);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler beim Anlegen");
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
            ? "Belege erfassen und Zahlungen dokumentieren."
            : "Lesezugriff auf Belege und Zahlungsstatus."
        }
        actions={
          canWrite ? (
            <Button type="button" onClick={() => setDrawerOpen(true)}>
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
              <Button type="button" onClick={() => setDrawerOpen(true)}>
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
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canWrite ? (
        <FormDrawer
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
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
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="inv-num">Rechnungsnummer</Label>
                <Input
                  id="inv-num"
                  value={form.invoice_number}
                  onChange={(e) =>
                    setForm({ ...form, invoice_number: e.target.value })
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
                    setForm({ ...form, document_type: e.target.value })
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
                    setForm({ ...form, recipient_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="inv-supplier">Lieferant (optional)</Label>
                <Input
                  id="inv-supplier"
                  value={form.supplier_name}
                  onChange={(e) =>
                    setForm({ ...form, supplier_name: e.target.value })
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
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="inv-issue">Datum</Label>
                <Input
                  id="inv-issue"
                  type="date"
                  value={form.issue_date}
                  onChange={(e) =>
                    setForm({ ...form, issue_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="inv-due">Fällig (optional)</Label>
                <Input
                  id="inv-due"
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="inv-desc">Beschreibung</Label>
              <Textarea
                id="inv-desc"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="inv-file">Anhang (PDF/Bild, optional)</Label>
              <Input
                id="inv-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </FormDrawer>
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
    </div>
  );
}
