"use client";

import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CalendarDays,
  MapPin,
  Music2,
  Plus,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  BESETZUNG_OPTIONS,
  besetzungLabel,
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
  year: number | null;
  starts_at: string | null;
  ends_at: string | null;
  subtitle: string | null;
  description: string | null;
  location: string | null;
  address: string | null;
  extra_info: string | null;
  ticket_url: string | null;
  show_on_website: boolean;
  needs_starts_at: boolean;
  is_current: boolean;
  notes: string | null;
  is_visible: boolean;
  item_count: number;
  recording_count: number;
  items?: ConcertItem[];
};

type ConcertForm = {
  title: string;
  date: string;
  startsAt: string;
  endsAt: string;
  subtitle: string;
  description: string;
  location: string;
  address: string;
  extraInfo: string;
  ticketUrl: string;
  showOnWebsite: boolean;
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
  date: "",
  startsAt: "",
  endsAt: "",
  subtitle: "",
  description: "",
  location: "",
  address: "",
  extraInfo: "",
  ticketUrl: "",
  showOnWebsite: false,
  notes: "",
});

function formatConcertDate(date: string | null) {
  if (!date) return null;
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function ConcertDateLocation({
  date,
  location,
  className,
}: {
  date: string | null;
  location: string | null;
  className?: string;
}) {
  const formatted = formatConcertDate(date);
  if (!formatted && !location) return null;

  return (
    <p
      className={
        className ??
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#5c574e]"
      }
    >
      {formatted ? (
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5 shrink-0 text-[#C8A24D]" aria-hidden />
          <span>{formatted}</span>
        </span>
      ) : null}
      {formatted && location ? (
        <span className="text-[#c4bbaa]" aria-hidden>
          •
        </span>
      ) : null}
      {location ? (
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0 text-[#C8A24D]" aria-hidden />
          <span>{location}</span>
        </span>
      ) : null}
    </p>
  );
}

const emptyItem = (): ItemForm => ({
  scoreId: "",
  title: "",
  ensemble: "ELIKUREN",
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
  const [activeDialogOpen, setActiveDialogOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string>("");
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
      date: row.date ?? "",
      startsAt: row.starts_at ?? "",
      endsAt: row.ends_at ?? "",
      subtitle: row.subtitle ?? "",
      description: row.description ?? "",
      location: row.location ?? "",
      address: row.address ?? "",
      extraInfo: row.extra_info ?? "",
      ticketUrl: row.ticket_url ?? "",
      showOnWebsite: row.show_on_website,
      notes: row.notes ?? "",
    });
    setEditTarget(row);
  }

  function openActiveDialog() {
    const current = items.find((row) => row.is_current);
    setActiveDraftId(current?.id ?? "");
    setActiveDialogOpen(true);
  }

  function saveActiveConcert() {
    startTransition(async () => {
      const res = await fetch("/api/admin/concerts/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concertId: activeDraftId || null,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        toast.error(err.detail ?? "Aktives Konzert konnte nicht gesetzt werden");
        return;
      }
      const data = (await res.json()) as { concert: ConcertRow | null };
      setActiveDialogOpen(false);
      await load(search || undefined);
      if (data.concert) {
        toast.success(`Aktives Konzert: ${data.concert.title}`);
      } else {
        toast.success("Kein aktives Konzert festgelegt");
      }
    });
  }

  function saveConcert(isCreate: boolean) {
    if (!form.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    if (form.showOnWebsite && !form.startsAt) {
      toast.error("Website-Anzeige braucht eine echte Startzeit (startsAt)");
      return;
    }
    startTransition(async () => {
      const payload = {
        title: form.title.trim(),
        date: form.date || null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        extraInfo: form.extraInfo.trim() || null,
        ticketUrl: form.ticketUrl.trim() || null,
        showOnWebsite: form.showOnWebsite,
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
        ensemble: item.ensemble ?? "ELIKUREN",
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
      ensemble: score.voice_group ?? "ELIKUREN",
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
          ensemble: itemForm.ensemble || "ELIKUREN",
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
  const activeConcert = items.find((row) => row.is_current) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konzerte"
        description="Programme pflegen, aktives Konzert festlegen und Programmpunkte zuordnen."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Neues Konzert
          </Button>
        }
      />

      <section className="rounded-2xl border border-[#d9d2c4] bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Music2 className="size-5 text-[#C8A24D]" aria-hidden />
          <h2 className="font-heading text-lg font-semibold text-[#1f1f23]">
            Aktives Konzert
          </h2>
        </div>
        {activeConcert ? (
          <div className="space-y-4 rounded-xl border border-[#C8A24D]/40 bg-[#C8A24D]/10 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <p className="font-heading text-2xl font-semibold text-[#1f1f23]">
                  {activeConcert.title}
                </p>
                <ConcertDateLocation
                  date={activeConcert.date}
                  location={activeConcert.location}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[#3f3a34]"
                />
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <Badge variant="success">Aktiv</Badge>
                  {activeConcert.year ? (
                    <Badge
                      variant="default"
                      className="rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums"
                    >
                      {activeConcert.year}
                    </Badge>
                  ) : null}
                </div>
                <p className="max-w-xl text-sm text-[#5c574e]">
                  Dieses Konzert wird aktuell für Programme, Noten, Audio und
                  Mitschnitte verwendet.
                </p>
              </div>
              <Button type="button" onClick={openActiveDialog}>
                Aktives Konzert festlegen
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-dashed border-[#d9d2c4] bg-[#f7f4ee] px-4 py-4">
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-[#1f1f23]">
                Kein aktives Konzert festgelegt
              </p>
              <p className="max-w-xl text-sm text-[#5c574e]">
                Das aktive Konzert wird für Programme, Noten, Audio und
                Mitschnitte verwendet.
              </p>
            </div>
            <Button type="button" onClick={openActiveDialog}>
              Aktives Konzert festlegen
            </Button>
          </div>
        )}
      </section>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Konzert, Jahr, Ort…"
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
                      {besetzungLabel(item.ensemble)}
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
                <TableHead className="w-[88px]">Jahr</TableHead>
                <TableHead>Konzert</TableHead>
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
                    {row.year ? (
                      <Badge
                        variant="default"
                        className="rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums"
                      >
                        {row.year}
                      </Badge>
                    ) : (
                      <span className="text-sm text-[#8a8478]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#1f1f23]">{row.title}</p>
                        {row.is_current ? (
                          <Badge variant="success">Aktiv</Badge>
                        ) : null}
                      </div>
                      <ConcertDateLocation
                        date={row.date}
                        location={row.location}
                        className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5c574e]"
                      />
                    </div>
                  </TableCell>
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
            <Label htmlFor="ci-score">Note</Label>
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
              Auswahl übernimmt Titel, Verknüpfung und Besetzung aus dem Katalog.
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
            <Label htmlFor="ci-ensemble">Besetzung</Label>
            <select
              id="ci-ensemble"
              className={selectClass}
              value={itemForm.ensemble}
              onChange={(e) =>
                setItemForm({ ...itemForm, ensemble: e.target.value })
              }
            >
              {BESETZUNG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormDrawer>

      <Dialog open={activeDialogOpen} onOpenChange={setActiveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aktives Konzert festlegen</DialogTitle>
            <DialogDescription>
              Das aktive Konzert wird für Noten, Audio und weitere Zuordnungen
              verwendet.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d9d2c4] bg-white px-3 py-2.5">
              <input
                type="radio"
                name="active-concert"
                className="mt-1"
                checked={activeDraftId === ""}
                onChange={() => setActiveDraftId("")}
              />
              <span>
                <span className="block font-medium text-[#1f1f23]">
                  Kein aktives Konzert
                </span>
                <span className="text-xs text-[#8a8478]">
                  Alle aktiven Markierungen entfernen
                </span>
              </span>
            </label>
            {items.map((row) => (
              <label
                key={row.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d9d2c4] bg-white px-3 py-2.5"
              >
                <input
                  type="radio"
                  name="active-concert"
                  className="mt-1"
                  checked={activeDraftId === row.id}
                  onChange={() => setActiveDraftId(row.id)}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#1f1f23]">{row.title}</span>
                    {row.year ? (
                      <Badge
                        variant="default"
                        className="rounded-md px-2 py-0.5 text-xs font-semibold"
                      >
                        {row.year}
                      </Badge>
                    ) : null}
                  </span>
                  <ConcertDateLocation
                    date={row.date}
                    location={row.location}
                    className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8a8478]"
                  />
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setActiveDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={saveActiveConcert}
            >
              Übernehmen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <Label htmlFor="c-subtitle">Untertitel (Website)</Label>
        <Input
          id="c-subtitle"
          value={form.subtitle}
          onChange={(e) => onChange({ ...form, subtitle: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-starts">Start (Europe/Berlin)</Label>
        <Input
          id="c-starts"
          type="datetime-local"
          value={form.startsAt}
          onChange={(e) => onChange({ ...form, startsAt: e.target.value })}
        />
        <p className="text-xs text-[#8a8478]">
          Pflicht für Website-Anzeige — keine Platzhalter-Uhrzeit.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-ends">Ende (optional)</Label>
        <Input
          id="c-ends"
          type="datetime-local"
          value={form.endsAt}
          onChange={(e) => onChange({ ...form, endsAt: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-date">Bibliotheks-Datum (optional)</Label>
        <Input
          id="c-date"
          type="date"
          value={form.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-location">Ort</Label>
        <Input
          id="c-location"
          value={form.location}
          onChange={(e) => onChange({ ...form, location: e.target.value })}
          placeholder="z. B. Kath. Pfarrkirche St. Bonifatius"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-address">Adresse</Label>
        <Input
          id="c-address"
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-description">Beschreibung (Website)</Label>
        <Textarea
          id="c-description"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-extra">Zusatzinfo</Label>
        <Textarea
          id="c-extra"
          value={form.extraInfo}
          onChange={(e) => onChange({ ...form, extraInfo: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-ticket">Ticket-URL</Label>
        <Input
          id="c-ticket"
          value={form.ticketUrl}
          onChange={(e) => onChange({ ...form, ticketUrl: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="c-web"
          type="checkbox"
          checked={form.showOnWebsite}
          onChange={(e) =>
            onChange({ ...form, showOnWebsite: e.target.checked })
          }
          className="size-4 rounded border-[#d9d2c4]"
        />
        <Label htmlFor="c-web">Auf Website anzeigen</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-notes">Interne Notizen</Label>
        <Textarea
          id="c-notes"
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
