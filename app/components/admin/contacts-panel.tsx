"use client";

import { Archive, ContactRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
} from "@/lib/contact-types";

type ContactType = (typeof CONTACT_TYPES)[number];

type ContactItem = {
  id: string;
  type: ContactType;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  organization: string | null;
  phone: string | null;
  notes: string | null;
  linked_user_id: string | null;
  linked_user: {
    id: string;
    email: string | null;
    firstname: string | null;
    lastname: string | null;
  } | null;
  archived_at: string | null;
  created_at: string;
};

type MemberOption = {
  id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
};

type ContactForm = {
  type: ContactType;
  firstname: string;
  lastname: string;
  email: string;
  organization: string;
  phone: string;
  notes: string;
  linked_user_id: string;
};

const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

const emptyForm = (): ContactForm => ({
  type: "OTHER",
  firstname: "",
  lastname: "",
  email: "",
  organization: "",
  phone: "",
  notes: "",
  linked_user_id: "",
});

function contactName(item: ContactItem) {
  const name = [item.firstname, item.lastname].filter(Boolean).join(" ");
  return name || item.organization || "Ohne Name";
}

function formFromItem(item: ContactItem): ContactForm {
  return {
    type: item.type,
    firstname: item.firstname ?? "",
    lastname: item.lastname ?? "",
    email: item.email ?? "",
    organization: item.organization ?? "",
    phone: item.phone ?? "",
    notes: item.notes ?? "",
    linked_user_id: item.linked_user_id ?? "",
  };
}

export function ContactsPanel() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showArchived, setShowArchived] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ContactItem | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<ContactItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ContactItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (typeFilter) params.set("type", typeFilter);
      if (showArchived) params.set("archived", "1");
      const qs = params.toString();
      const res = await fetch(`/api/admin/contacts${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: ContactItem[] };
      setItems(data.items);
    } catch {
      toast.error("Kontakte konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    try {
      const res = await fetch("/api/admin/members");
      if (!res.ok) return;
      const data = (await res.json()) as { items: MemberOption[] };
      setMembers(data.items);
    } catch {
      /* optional */
    }
  }

  useEffect(() => {
    void load();
  }, [showArchived, typeFilter]);

  useEffect(() => {
    void loadMembers();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDrawerOpen(true);
  }

  function openEdit(item: ContactItem) {
    setEditing(item);
    setForm(formFromItem(item));
    setDrawerOpen(true);
  }

  function save() {
    const payload = {
      type: form.type,
      firstname: form.firstname.trim() || null,
      lastname: form.lastname.trim() || null,
      email: form.email.trim() || null,
      organization: form.organization.trim() || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      linked_user_id: form.linked_user_id || null,
    };

    startTransition(async () => {
      const res = editing
        ? await fetch(`/api/admin/contacts/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        toast.error(editing ? "Speichern fehlgeschlagen" : "Anlegen fehlgeschlagen");
        return;
      }

      toast.success(editing ? "Kontakt aktualisiert" : "Kontakt angelegt");
      setDrawerOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await load();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/contacts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Löschen fehlgeschlagen");
        return;
      }
      const data = (await res.json()) as { archived?: boolean; deleted?: boolean };
      toast.success(data.archived ? "Kontakt archiviert" : "Kontakt gelöscht");
      setDeleteTarget(null);
      await load();
    });
  }

  function confirmArchive() {
    if (!archiveTarget) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/contacts/${archiveTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) {
        toast.error("Archivieren fehlgeschlagen");
        return;
      }
      toast.success("Kontakt archiviert");
      setArchiveTarget(null);
      await load();
    });
  }

  return (
    <div>
      <PageHeader
        title="Kontakte"
        description="Adressbuch für Chormitglieder, Dienstleister und Veranstalter."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Neuer Kontakt
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Name, E-Mail, Organisation…"
        filters={
          <>
            <select
              className={selectClass + " max-w-[180px]"}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Alle Typen</option>
              {CONTACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CONTACT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant={showArchived ? "default" : "outline"}
              className={!showArchived ? "border-[#d9d2c4]" : undefined}
              onClick={() => setShowArchived((v) => !v)}
            >
              Archivierte
            </Button>
          </>
        }
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-[#d9d2c4]"
            onClick={() => void load()}
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
          icon={ContactRound}
          title="Keine Kontakte gefunden"
          description="Lege einen neuen Kontakt an oder passe die Filter an."
          action={
            <Button type="button" onClick={openCreate}>
              Neuer Kontakt
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{contactName(item)}</TableCell>
                  <TableCell>{CONTACT_TYPE_LABELS[item.type]}</TableCell>
                  <TableCell className="text-[#5c574e]">
                    {item.email ?? "—"}
                  </TableCell>
                  <TableCell>{item.phone ?? "—"}</TableCell>
                  <TableCell>
                    {item.archived_at ? (
                      <Badge variant="danger">Archiviert</Badge>
                    ) : (
                      <Badge variant="success">Aktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4]"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      {!item.archived_at ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-[#d9d2c4]"
                          onClick={() => setArchiveTarget(item)}
                        >
                          <Archive className="size-3.5" />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4] text-red-700"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setEditing(null);
            setForm(emptyForm());
          }
        }}
        title={editing ? "Kontakt bearbeiten" : "Neuer Kontakt"}
        loading={pending}
        onSubmit={save}
        submitLabel={editing ? "Speichern" : "Anlegen"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="ct-type">Typ</Label>
            <select
              id="ct-type"
              className={selectClass}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ContactType })
              }
            >
              {CONTACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CONTACT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ct-firstname">Vorname</Label>
              <Input
                id="ct-firstname"
                value={form.firstname}
                onChange={(e) =>
                  setForm({ ...form, firstname: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="ct-lastname">Nachname</Label>
              <Input
                id="ct-lastname"
                value={form.lastname}
                onChange={(e) =>
                  setForm({ ...form, lastname: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ct-org">Organisation</Label>
            <Input
              id="ct-org"
              value={form.organization}
              onChange={(e) =>
                setForm({ ...form, organization: e.target.value })
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ct-email">E-Mail</Label>
              <Input
                id="ct-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ct-phone">Telefon</Label>
              <Input
                id="ct-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ct-linked">Verknüpftes Mitglied (optional)</Label>
            <select
              id="ct-linked"
              className={selectClass}
              value={form.linked_user_id}
              onChange={(e) =>
                setForm({ ...form, linked_user_id: e.target.value })
              }
            >
              <option value="">—</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {[member.firstname, member.lastname]
                    .filter(Boolean)
                    .join(" ") || member.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ct-notes">Notizen</Label>
            <Textarea
              id="ct-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Kontakt löschen?"
        description={
          deleteTarget?.linked_user_id
            ? "Verknüpfte Kontakte werden archiviert statt gelöscht."
            : deleteTarget
              ? `„${contactName(deleteTarget)}" wird unwiderruflich gelöscht.`
              : undefined
        }
        confirmLabel="Löschen"
        destructive
        loading={pending}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={archiveTarget != null}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Kontakt archivieren?"
        description={
          archiveTarget
            ? `„${contactName(archiveTarget)}" wird ins Archiv verschoben.`
            : undefined
        }
        confirmLabel="Archivieren"
        loading={pending}
        onConfirm={confirmArchive}
      />
    </div>
  );
}
