"use client";

import { ArrowDown, ArrowUp, CalendarDays, Plus } from "lucide-react";
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
import {
  ENSEMBLE_LABELS,
  ENSEMBLE_OPTIONS,
} from "@/lib/voice-options";

type ScoreOption = {
  id: string;
  title: string;
  composer: string;
  voice_group: string | null;
};

type ConcertItem = {
  id: string;
  sort_order: number;
  title: string;
  ensemble: string | null;
  sheet_file_id: string | null;
  audio_file_id: string | null;
};

type ConcertRow = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  is_current: boolean;
  notes: string | null;
  is_visible: boolean;
  item_count: number;
  recording_count: number;
  items?: ConcertItem[];
};

type ConcertForm = {
  title: string;
  slug: string;
  date: string;
  isCurrent: boolean;
  notes: string;
};

type ItemForm = {
  id?: string;
  scoreId: string;
  title: string;
  ensemble: string;
  sheetFileId: string;
};

const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

const emptyConcert = (): ConcertForm => ({
  title: "",
  slug: "",
  date: "",
  isCurrent: false,
  notes: "",
});

const emptyItem = (): ItemForm => ({
  scoreId: "",
  title: "",
  ensemble: "",
  sheetFileId: "",
});

export function ConcertsPanel() {
  const [items, setItems] = useState<ConcertRow[]>([]);
  const [scores, setScores] = useState<ScoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ConcertForm>(emptyConcert);
  const [editTarget, setEditTarget] = useState<ConcertRow | null>(null);
  const [detail, setDetail] = useState<ConcertRow | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/concerts${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: ConcertRow[] };
      setItems(data.items);
    } catch {
      toast.error("Konzerte konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  async function loadScores() {
    try {
      const res = await fetch("/api/admin/scores");
      if (!res.ok) return;
      const data = (await res.json()) as { items: ScoreOption[] };
      setScores(data.items);
    } catch {
      /* ignore — picker stays empty */
    }
  }

  async function loadDetail(id: string) {
    const res = await fetch(`/api/admin/concerts/${id}`);
    if (!res.ok) {
      toast.error("Konzert konnte nicht geladen werden");
      return;
    }
    const data = (await res.json()) as ConcertRow;
    setDetail(data);
  }

  useEffect(() => {
    void load();
    void loadScores();
  }, []);

  function openCreate() {
    setForm(emptyConcert());
    setCreateOpen(true);
  }

  function openEdit(row: ConcertRow) {
    setForm({
      title: row.title,
      slug: row.slug,
      date: row.date ?? "",
      isCurrent: row.is_current,
      notes: row.notes ?? "",
    });
    setEditTarget(row);
  }

  function saveConcert(isCreate: boolean) {
    if (!form.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    startTransition(async () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || null,
        date: form.date || null,
        isCurrent: form.isCurrent,
        notes: form.notes.trim() || null,
      };
      const res = await fetch(
        isCreate ? "/api/admin/concerts" : `/api/admin/concerts/${editTarget!.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        toast.error(err.detail ?? "Speichern fehlgeschlagen");
        return;
      }
      toast.success(isCreate ? "Konzert angelegt" : "Gespeichert");
      setCreateOpen(false);
      setEditTarget(null);
      await load(search || undefined);
      if (detail && !isCreate && editTarget?.id === detail.id) {
        await loadDetail(detail.id);
      }
    });
  }

  function openProgram(row: ConcertRow) {
    setReorderMode(false);
    void loadDetail(row.id);
  }

  function closeProgram() {
    setDetail(null);
    setReorderMode(false);
  }

  function openItemEdit(item?: ConcertItem) {
    if (item) {
      setItemForm({
        id: item.id,
        scoreId: item.sheet_file_id ?? "",
        title: item.title,
        ensemble: item.ensemble ?? "",
        sheetFileId: item.sheet_file_id ?? "",
      });
    } else {
      setItemForm(emptyItem());
    }
    void loadScores();
    setItemDrawerOpen(true);
  }

  function applyScoreSelection(scoreId: string) {
    if (!scoreId) {
      setItemForm((prev) => ({
        ...prev,
        scoreId: "",
        sheetFileId: "",
      }));
      return;
    }
    const score = scores.find((row) => row.id === scoreId);
    if (!score) return;
    setItemForm((prev) => ({
      ...prev,
      scoreId: score.id,
      sheetFileId: score.id,
      title: score.title,
      ensemble: score.voice_group ?? prev.ensemble,
    }));
  }

  function saveItem() {
    if (!detail) return;
    if (!itemForm.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/concerts/${detail.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemForm.id,
          title: itemForm.title.trim(),
          ensemble: itemForm.ensemble || null,
          sheetFileId: itemForm.sheetFileId.trim() || null,
          audioFileId: null,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        toast.error(err.detail ?? "Programmpunkt fehlgeschlagen");
        return;
      }
      toast.success("Programmpunkt gespeichert");
      setItemDrawerOpen(false);
      await loadDetail(detail.id);
      await load(search || undefined);
    });
  }

  function deleteItem(itemId: string) {
    if (!detail) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/concerts/${detail.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, delete: true }),
      });
      if (!res.ok) {
        toast.error("Löschen fehlgeschlagen");
        return;
      }
      toast.success("Programmpunkt entfernt");
      await loadDetail(detail.id);
      await load(search || undefined);
    });
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    if (!detail?.items) return;
    const ordered = [...detail.items].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const index = ordered.findIndex((row) => row.id === itemId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ordered.length) return;

    const swapped = [...ordered];
    const tmp = swapped[index]!;
    swapped[index] = swapped[next]!;
    swapped[next] = tmp;
    const orderedIds = swapped.map((row) => row.id);

    setDetail({
      ...detail,
      items: swapped.map((row, i) => ({ ...row, sort_order: i })),
    });

    startTransition(async () => {
      const res = await fetch(`/api/admin/concerts/${detail.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) {
        toast.error("Reihenfolge konnte nicht gespeichert werden");
        await loadDetail(detail.id);
        return;
      }
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/concerts/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Löschen fehlgeschlagen");
        return;
      }
      toast.success("Konzert gelöscht");
      if (detail?.id === deleteId) closeProgram();
      setDeleteId(null);
      await load(search || undefined);
    });
  }

  const programItems = [...(detail?.items ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konzerte"
        description="Programme pflegen, aktuelles Konzert markieren und Programmpunkte zuordnen."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Neues Konzert
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Konzert suchen…"
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

      {detail ? (
        <section className="space-y-3 rounded-2xl border border-[#d9d2c4] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#1f1f23]">
                Programm: {detail.title}
              </h2>
              <p className="text-sm text-[#5c574e]">
                Punkte aus dem Notenkatalog hinzufügen und die Reihenfolge
                anpassen.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => openItemEdit()}>
                <Plus className="size-4" />
                Programmpunkt
              </Button>
              <Button
                size="sm"
                variant={reorderMode ? "secondary" : "outline"}
                disabled={programItems.length < 2}
                onClick={() => setReorderMode((v) => !v)}
              >
                {reorderMode ? "Reihenfolge fertig" : "Reihenfolge bearbeiten"}
              </Button>
              <Button size="sm" variant="secondary" onClick={closeProgram}>
                Schließen
              </Button>
            </div>
          </div>
          {programItems.length === 0 ? (
            <p className="text-sm text-[#5c574e]">Noch keine Programmpunkte.</p>
          ) : (
            <ul className="space-y-2">
              {programItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#ebe4d8] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#1f1f23]">
                      {index + 1}. {item.title}
                    </p>
                    <p className="text-xs text-[#8a8478]">
                      {item.ensemble
                        ? (ENSEMBLE_LABELS[item.ensemble] ?? item.ensemble)
                        : "Elikuren / alle"}
                      {item.sheet_file_id ? " · Note verknüpft" : ""}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    {reorderMode ? (
                      <>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={pending || index === 0}
                          onClick={() => moveItem(item.id, -1)}
                          aria-label="Nach oben"
                          title="Nach oben"
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={
                            pending || index === programItems.length - 1
                          }
                          onClick={() => moveItem(item.id, 1)}
                          aria-label="Nach unten"
                          title="Nach unten"
                        >
                          <ArrowDown />
                        </Button>
                      </>
                    ) : (
                      <>
                        <AdminEditButton
                          onClick={() => openItemEdit(item)}
                          aria-label="Programmpunkt bearbeiten"
                        />
                        <AdminDeleteButton
                          iconOnly
                          onClick={() => deleteItem(item.id)}
                          label="Programmpunkt löschen"
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Keine Konzerte"
          description="Lege ein Konzert an und baue das Programm daraus."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#d9d2c4] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Programm</TableHead>
                <TableHead>Mitschnitte</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap text-right">
                  Aktionen
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={detail?.id === row.id ? "selected" : undefined}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-[#1f1f23]">{row.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {row.is_current ? (
                          <Badge variant="success">Aktuell</Badge>
                        ) : null}
                        <span className="text-xs text-[#8a8478]">{row.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{row.date ?? "—"}</TableCell>
                  <TableCell>{row.item_count}</TableCell>
                  <TableCell>{row.recording_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={
                          detail?.id === row.id ? "default" : "secondary"
                        }
                        onClick={() => openProgram(row)}
                      >
                        Programm
                      </Button>
                      <AdminEditButton onClick={() => openEdit(row)} />
                      <AdminDeleteButton
                        iconOnly
                        onClick={() => setDeleteId(row.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDrawer
        open={createOpen || Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "Konzert bearbeiten" : "Neues Konzert"}
        loading={pending}
        onSubmit={() => saveConcert(!editTarget)}
      >
        <ConcertFields form={form} onChange={setForm} />
      </FormDrawer>

      <FormDrawer
        open={itemDrawerOpen}
        onOpenChange={setItemDrawerOpen}
        title={itemForm.id ? "Programmpunkt bearbeiten" : "Programmpunkt"}
        loading={pending}
        onSubmit={saveItem}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ci-score">Note & PDF</Label>
            <select
              id="ci-score"
              className={selectClass}
              value={itemForm.scoreId}
              onChange={(e) => applyScoreSelection(e.target.value)}
            >
              <option value="">Note aus Katalog wählen…</option>
              {scores.map((score) => (
                <option key={score.id} value={score.id}>
                  {score.title}
                  {score.composer ? ` — ${score.composer}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#8a8478]">
              Auswahl übernimmt Titel, Verknüpfung und Ensemble aus dem Katalog.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-title">Titel</Label>
            <Input
              id="ci-title"
              value={itemForm.title}
              onChange={(e) =>
                setItemForm({ ...itemForm, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-ensemble">Ensemble</Label>
            <select
              id="ci-ensemble"
              className={selectClass}
              value={itemForm.ensemble}
              onChange={(e) =>
                setItemForm({ ...itemForm, ensemble: e.target.value })
              }
            >
              {ENSEMBLE_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Konzert löschen?"
        description="Programm und Zuordnungen werden entfernt. Dateien im Katalog bleiben erhalten."
        confirmLabel="Löschen"
        destructive
        loading={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ConcertFields({
  form,
  onChange,
}: {
  form: ConcertForm;
  onChange: (next: ConcertForm) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="c-title">Titel</Label>
        <Input
          id="c-title"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-slug">Slug (optional)</Label>
        <Input
          id="c-slug"
          value={form.slug}
          onChange={(e) => onChange({ ...form, slug: e.target.value })}
          placeholder="wird aus dem Titel erzeugt"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-date">Datum</Label>
        <Input
          id="c-date"
          type="date"
          value={form.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-notes">Notizen</Label>
        <Textarea
          id="c-notes"
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#5c574e]">
        <input
          type="checkbox"
          checked={form.isCurrent}
          onChange={(e) => onChange({ ...form, isCurrent: e.target.checked })}
        />
        Als aktuelles Konzert markieren
      </label>
    </div>
  );
}
