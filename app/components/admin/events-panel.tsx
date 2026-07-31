"use client";

import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
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

type EventItem = {
  id: string;
  title: string;
  type: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  rsvp_deadline: string | null;
  response_count: number;
  rsvp_summary?: Record<string, { yes: number; no: number; maybe: number }>;
};

type EventForm = {
  title: string;
  type: string;
  starts_at: string;
  ends_at: string;
  location: string;
  description: string;
  rsvp_deadline: string;
};

const EVENT_TYPES = [
  "REHEARSAL",
  "SPECIAL_REHEARSAL",
  "GENERAL_REHEARSAL",
  "CONCERT",
  "SERVICE",
  "PERFORMANCE",
  "OTHER",
] as const;

const TYPE_LABELS: Record<string, string> = {
  REHEARSAL: "Probe",
  SPECIAL_REHEARSAL: "Sonderprobe",
  GENERAL_REHEARSAL: "Generalprobe",
  CONCERT: "Konzert",
  SERVICE: "Gottesdienst",
  PERFORMANCE: "Auftritt",
  OTHER: "Sonstiges",
};

const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

const emptyForm = (): EventForm => ({
  title: "",
  type: "REHEARSAL",
  starts_at: "",
  ends_at: "",
  location: "",
  description: "",
  rsvp_deadline: "",
});

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formFromItem(item: EventItem): EventForm {
  return {
    title: item.title,
    type: item.type,
    starts_at: toLocalDatetimeValue(item.starts_at),
    ends_at: toLocalDatetimeValue(item.ends_at),
    location: item.location ?? "",
    description: item.description ?? "",
    rsvp_deadline: toLocalDatetimeValue(item.rsvp_deadline),
  };
}

export function AdminEventsPanel() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: EventItem[] };
      setItems(data.items);
    } catch {
      toast.error("Termine konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDrawerOpen(true);
  }

  function openEdit(item: EventItem) {
    setEditing(item);
    setForm(formFromItem(item));
    setDrawerOpen(true);
  }

  function save() {
    if (!form.title.trim() || !form.starts_at) {
      toast.error("Titel und Start sind erforderlich");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: form.title,
        type: form.type,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        location: form.location || null,
        description: form.description || null,
        rsvp_deadline: form.rsvp_deadline
          ? new Date(form.rsvp_deadline).toISOString()
          : null,
      };

      const res = editing
        ? await fetch(`/api/admin/events/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        toast.error(editing ? "Speichern fehlgeschlagen" : "Anlegen fehlgeschlagen");
        return;
      }

      toast.success(editing ? "Termin aktualisiert" : "Termin angelegt");
      setDrawerOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await load();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Löschen fehlgeschlagen");
        return;
      }
      toast.success("Termin gelöscht");
      setDeleteTarget(null);
      await load();
    });
  }

  return (
    <div>
      <PageHeader
        title="Termine"
        description="Proben und Auftritte anlegen, bearbeiten und RSVP-Übersicht einsehen."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Neuer Termin
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
          icon={CalendarDays}
          title="Keine Termine"
          description="Lege den ersten Termin an."
          action={
            <Button type="button" onClick={openCreate}>
              Neuer Termin
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{TYPE_LABELS[event.type] ?? event.type}</TableCell>
                  <TableCell>
                    {new Date(event.starts_at).toLocaleString("de-DE")}
                  </TableCell>
                  <TableCell>{event.location ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="default">{event.response_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4]"
                        onClick={() => openEdit(event)}
                      >
                        <Pencil className="size-3.5" />
                        Bearbeiten
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4] text-red-700"
                        onClick={() => setDeleteTarget(event)}
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
        title={editing ? "Termin bearbeiten" : "Neuer Termin"}
        loading={pending}
        onSubmit={save}
        submitLabel={editing ? "Speichern" : "Anlegen"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="ev-title">Titel</Label>
            <Input
              id="ev-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ev-type">Typ</Label>
              <select
                id="ev-type"
                className={selectClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="ev-start">Start</Label>
              <Input
                id="ev-start"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({ ...form, starts_at: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ev-end">Ende (optional)</Label>
              <Input
                id="ev-end"
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ev-deadline">RSVP-Frist (optional)</Label>
              <Input
                id="ev-deadline"
                type="datetime-local"
                value={form.rsvp_deadline}
                onChange={(e) =>
                  setForm({ ...form, rsvp_deadline: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ev-location">Ort</Label>
            <Input
              id="ev-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ev-desc">Beschreibung</Label>
            <Textarea
              id="ev-desc"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          {editing?.rsvp_summary ? (
            <div className="rounded-xl border border-[#ebe4d8] bg-white/80 p-3 text-sm">
              <p className="mb-2 font-medium text-[#1f1f23]">RSVP nach Stimme</p>
              {Object.keys(editing.rsvp_summary).length === 0 ? (
                <p className="text-[#5c574e]">Noch keine Rückmeldungen</p>
              ) : (
                <ul className="space-y-1 text-[#5c574e]">
                  {Object.entries(editing.rsvp_summary).map(([voice, counts]) => (
                    <li key={voice}>
                      {voice}: {counts.yes} zu, {counts.maybe} vielleicht,{" "}
                      {counts.no} ab
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Termin löschen?"
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
