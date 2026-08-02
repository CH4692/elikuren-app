"use client";

import { Eye, FileMusic, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminEditButton } from "@/components/admin/admin-edit-button";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { FormDrawer } from "@/components/app/form-drawer";
import { PageHeader } from "@/components/app/page-header";
import { PdfPreview } from "@/components/library/pdf-preview";
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
import { formatConcertLabel } from "@/lib/concert-label";
import { uploadFileViaPresign } from "@/lib/upload-client";
import {
  BESETZUNG_OPTIONS,
  besetzungLabel,
} from "@/lib/voice-options";

type ConcertOption = {
  id: string;
  title: string;
  year?: number | null;
  date?: string | null;
  label?: string;
};

type ScoreItem = {
  id: string;
  title: string;
  composer: string;
  voice_group: string | null;
  access_scope: string;
  is_visible: boolean;
  concert_id: string | null;
  concert: (ConcertOption & { label?: string }) | null;
  stored_file: {
    id: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    upload_status: string;
  };
  updated_at: string;
};

type ScoreForm = {
  title: string;
  composer: string;
  voiceGroup: string;
  accessScope: string;
  concertId: string;
};

const SCOPE_OPTIONS = [
  { value: "ALL_MEMBERS", label: "Alle Mitglieder" },
  { value: "VOICE_GROUP_ONLY", label: "Nur Besetzung" },
  { value: "ADMIN_ONLY", label: "Nur Admin" },
] as const;

const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

const emptyForm = (): ScoreForm => ({
  title: "",
  composer: "",
  voiceGroup: "ELIKUREN",
  accessScope: "ALL_MEMBERS",
  concertId: "",
});

function scopeLabel(value: string) {
  return SCOPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function ScoresPanel() {
  const [items, setItems] = useState<ScoreItem[]>([]);
  const [concerts, setConcerts] = useState<ConcertOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ScoreItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScoreItem | null>(null);
  const [preview, setPreview] = useState<{
    fileId: string;
    title: string;
  } | null>(null);
  const [form, setForm] = useState<ScoreForm>(emptyForm());
  const [file, setFile] = useState<File | null>(null);

  async function loadConcerts() {
    try {
      const res = await fetch("/api/admin/concerts");
      if (!res.ok) return;
      const data = (await res.json()) as { items: ConcertOption[] };
      setConcerts(data.items);
    } catch {
      /* ignore */
    }
  }

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/scores${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: ScoreItem[] };
      setItems(data.items);
    } catch {
      toast.error("Noten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void loadConcerts();
  }, []);

  function openCreate() {
    setForm(emptyForm());
    setFile(null);
    void loadConcerts();
    setCreateOpen(true);
  }

  function openEdit(item: ScoreItem) {
    setForm({
      title: item.title,
      composer: item.composer,
      voiceGroup: item.voice_group ?? "ELIKUREN",
      accessScope: item.access_scope,
      concertId: item.concert_id ?? item.concert?.id ?? "",
    });
    void loadConcerts();
    setEditTarget(item);
  }

  function createScore() {
    if (!file) {
      toast.error("PDF-Datei ist Pflicht");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    if (!form.concertId) {
      toast.error("Konzert ist Pflicht");
      return;
    }

    startTransition(async () => {
      try {
        const uploaded = await uploadFileViaPresign({
          file,
          category: "SHEET",
        });
        const res = await fetch("/api/admin/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storedFileId: uploaded.fileId,
            title: form.title.trim(),
            composer: form.composer.trim() || null,
            voiceGroup: form.voiceGroup || "ELIKUREN",
            accessScope: form.accessScope,
            concertId: form.concertId,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          toast.error(err.detail ?? "Note konnte nicht angelegt werden");
          return;
        }
        toast.success("Note angelegt");
        setCreateOpen(false);
        setFile(null);
        setForm(emptyForm());
        await load(search || undefined);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
      }
    });
  }

  function saveEdit() {
    if (!editTarget) return;
    if (!form.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    if (!form.concertId) {
      toast.error("Konzert ist Pflicht");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/sheets/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          composer: form.composer.trim() || null,
          voiceGroup: form.voiceGroup || "ELIKUREN",
          accessScope: form.accessScope,
          concertId: form.concertId,
        }),
      });
      if (!res.ok) {
        toast.error("Speichern fehlgeschlagen");
        return;
      }
      toast.success("Gespeichert");
      setEditTarget(null);
      await load(search || undefined);
    });
  }

  return (
    <div>
      <PageHeader
        title="Noten"
        description="Chornoten einem Konzert zuordnen, hochladen und Metadaten bearbeiten."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Note hochladen
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Titel, Komponist, Konzert, Dateiname…"
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileMusic}
          title="Keine Noten gefunden"
          description="Lade die erste Note über „Note hochladen“ hoch."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Komponist</TableHead>
                <TableHead>Konzert</TableHead>
                <TableHead>Besetzung</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.title}</div>
                    <div className="text-xs text-[#5c574e]">
                      {item.stored_file.original_name}
                    </div>
                  </TableCell>
                  <TableCell>{item.composer || "—"}</TableCell>
                  <TableCell>
                    {item.concert
                      ? item.concert.label ??
                        formatConcertLabel(item.concert)
                      : "—"}
                  </TableCell>
                  <TableCell>{besetzungLabel(item.voice_group)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPreview({
                            fileId: item.stored_file.id,
                            title: item.title,
                          })
                        }
                      >
                        <Eye />
                        Vorschau
                      </Button>
                      <AdminEditButton onClick={() => openEdit(item)} />
                      <AdminDeleteButton
                        iconOnly
                        onClick={() => setDeleteTarget(item)}
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
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Note hochladen"
        description="PDF hochladen, Konzert zuordnen und Metadaten setzen."
        submitLabel="Hochladen"
        loading={pending}
        onSubmit={createScore}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score-file">PDF-Datei</Label>
            <Input
              id="score-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <ScoreFormFields
            form={form}
            onChange={setForm}
            concerts={concerts}
          />
        </div>
      </FormDrawer>

      <FormDrawer
        open={editTarget != null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Note bearbeiten"
        description={
          editTarget
            ? scopeLabel(editTarget.access_scope)
            : undefined
        }
        loading={pending}
        onSubmit={saveEdit}
      >
        <ScoreFormFields
          form={form}
          onChange={setForm}
          concerts={concerts}
        />
      </FormDrawer>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Note löschen?"
        description={
          deleteTarget
            ? `„${deleteTarget.title}“ wird entfernt.`
            : undefined
        }
        confirmLabel="Löschen"
        destructive
        loading={pending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const res = await fetch(`/api/admin/sheets/${deleteTarget.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              toast.error("Löschen fehlgeschlagen");
              return;
            }
            toast.success("Gelöscht");
            setDeleteTarget(null);
            await load(search || undefined);
          });
        }}
      />

      <PdfPreview
        open={Boolean(preview)}
        fileId={preview?.fileId ?? ""}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}

function ScoreFormFields({
  form,
  onChange,
  concerts,
}: {
  form: ScoreForm;
  onChange: (next: ScoreForm) => void;
  concerts: ConcertOption[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="score-concert">Konzert</Label>
        <select
          id="score-concert"
          className={selectClass}
          value={form.concertId}
          onChange={(e) => onChange({ ...form, concertId: e.target.value })}
          required
        >
          <option value="">Konzert wählen…</option>
          {concerts.map((concert) => (
            <option key={concert.id} value={concert.id}>
              {concert.label ?? formatConcertLabel(concert)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="score-title">Titel</Label>
        <Input
          id="score-title"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="score-composer">Komponist</Label>
        <Input
          id="score-composer"
          value={form.composer}
          onChange={(e) => onChange({ ...form, composer: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="score-voice">Besetzung</Label>
        <select
          id="score-voice"
          className={selectClass}
          value={form.voiceGroup}
          onChange={(e) => onChange({ ...form, voiceGroup: e.target.value })}
        >
          {BESETZUNG_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="score-scope">Zugriff</Label>
        <select
          id="score-scope"
          className={selectClass}
          value={form.accessScope}
          onChange={(e) => onChange({ ...form, accessScope: e.target.value })}
        >
          {SCOPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
