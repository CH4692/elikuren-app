"use client";

import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
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

type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  is_important: boolean;
  published_at: string | null;
  expires_at: string | null;
  read_count: number;
};

type AnnouncementForm = {
  title: string;
  body: string;
  is_important: boolean;
  expires_at: string;
  publish: boolean;
};

const emptyForm = (): AnnouncementForm => ({
  title: "",
  body: "",
  is_important: false,
  expires_at: "",
  publish: false,
});

export function AdminAnnouncementsPanel() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: AnnouncementItem[] };
      setItems(data.items);
    } catch {
      toast.error("Mitteilungen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setDrawerOpen(true);
  }

  function openEdit(item: AnnouncementItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      is_important: item.is_important,
      expires_at: item.expires_at
        ? new Date(item.expires_at).toISOString().slice(0, 16)
        : "",
      publish: Boolean(item.published_at),
    });
    setDrawerOpen(true);
  }

  function saveItem() {
    startTransition(async () => {
      const payload = {
        title: form.title,
        body: form.body,
        is_important: form.is_important,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
        publish: form.publish,
      };

      const res = await fetch(
        editingId
          ? `/api/admin/announcements/${editingId}`
          : "/api/admin/announcements",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        toast.error(
          editingId
            ? "Mitteilung konnte nicht gespeichert werden"
            : "Mitteilung konnte nicht angelegt werden",
        );
        return;
      }
      toast.success(
        form.publish ? "Veröffentlicht" : editingId ? "Gespeichert" : "Entwurf gespeichert",
      );
      setDrawerOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    });
  }

  function publish(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: true }),
      });
      if (!res.ok) {
        toast.error("Veröffentlichen fehlgeschlagen");
        return;
      }
      toast.success("Veröffentlicht");
      await load();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Löschen fehlgeschlagen");
        return;
      }
      toast.success("Gelöscht");
      setDeleteTarget(null);
      await load();
    });
  }

  return (
    <div>
      <PageHeader
        title="Mitteilungen"
        description="Ankündigungen erstellen und veröffentlichen."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Neue Mitteilung
          </Button>
        }
      />

      <DataTableToolbar />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Keine Mitteilungen"
          description="Erstelle die erste Ankündigung für den Chor."
          action={
            <Button type="button" onClick={openCreate}>
              Neue Mitteilung
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gelesen</TableHead>
                <TableHead>Ablauf</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    {item.is_important ? (
                      <Badge variant="warning" className="mt-1">
                        Wichtig
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {item.published_at ? (
                      <Badge variant="success">Veröffentlicht</Badge>
                    ) : (
                      <Badge variant="warning">Entwurf</Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.read_count}</TableCell>
                  <TableCell>
                    {item.expires_at
                      ? new Date(item.expires_at).toLocaleString("de-DE")
                      : "—"}
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
                        Bearbeiten
                      </Button>
                      {!item.published_at ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => publish(item.id)}
                        >
                          Veröffentlichen
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
            setEditingId(null);
            setForm(emptyForm());
          }
        }}
        title={editingId ? "Mitteilung bearbeiten" : "Neue Mitteilung"}
        loading={pending}
        onSubmit={saveItem}
        submitLabel="Speichern"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="ann-title">Titel</Label>
            <Input
              id="ann-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ann-body">Text</Label>
            <Textarea
              id="ann-body"
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ann-expires">Ablauf (optional)</Label>
            <Input
              id="ann-expires"
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) =>
                setForm({ ...form, expires_at: e.target.value })
              }
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_important}
                onChange={(e) =>
                  setForm({ ...form, is_important: e.target.checked })
                }
              />
              Wichtig
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(e) =>
                  setForm({ ...form, publish: e.target.checked })
                }
              />
              Sofort veröffentlichen
            </label>
          </div>
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Mitteilung löschen?"
        description={
          deleteTarget
            ? `„${deleteTarget.title}" wird unwiderruflich gelöscht.`
            : undefined
        }
        confirmLabel="Löschen"
        destructive
        loading={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
