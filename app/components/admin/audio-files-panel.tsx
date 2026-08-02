"use client";

import { FileAudio, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminEditButton } from "@/components/admin/admin-edit-button";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { FormDrawer } from "@/components/app/form-drawer";
import { PageHeader } from "@/components/app/page-header";
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
import { uploadFileViaPresign } from "@/lib/upload-client";
import {
  AUDIO_TYPE_OPTIONS,
  BESETZUNG_OPTIONS,
  besetzungLabel,
} from "@/lib/voice-options";

type ConcertOption = {
  id: string;
  title: string;
};

type AudioItem = {
  id: string;
  title: string;
  composer: string;
  audio_type: string;
  voice_group: string | null;
  access_scope: string;
  duration_seconds: number | null;
  is_visible: boolean;
  concert_id: string | null;
  concert: ConcertOption | null;
  stored_file: {
    id: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    upload_status: string;
  };
  updated_at: string;
};

type AudioForm = {
  title: string;
  composer: string;
  voiceGroup: string;
  audioType: string;
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

const emptyForm = (): AudioForm => ({
  title: "",
  composer: "",
  voiceGroup: "ELIKUREN",
  audioType: "OTHER",
  accessScope: "ALL_MEMBERS",
  concertId: "",
});

function audioTypeLabel(value: string) {
  return AUDIO_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function AudioFilesPanel() {
  const [items, setItems] = useState<AudioItem[]>([]);
  const [concerts, setConcerts] = useState<ConcertOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AudioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AudioItem | null>(null);
  const [form, setForm] = useState<AudioForm>(emptyForm());
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
      const res = await fetch(`/api/admin/audio${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: AudioItem[] };
      setItems(data.items);
    } catch {
      toast.error("Audiodateien konnten nicht geladen werden");
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

  function openEdit(item: AudioItem) {
    setForm({
      title: item.title,
      composer: item.composer,
      voiceGroup: item.voice_group ?? "ELIKUREN",
      audioType: item.audio_type,
      accessScope: item.access_scope,
      concertId: item.concert_id ?? item.concert?.id ?? "",
    });
    void loadConcerts();
    setEditTarget(item);
  }

  function createAudio() {
    if (!file) {
      toast.error("Audiodatei ist Pflicht");
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
          category: "AUDIO",
          audioType: form.audioType,
        });
        const res = await fetch("/api/admin/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storedFileId: uploaded.fileId,
            title: form.title.trim(),
            composer: form.composer.trim() || null,
            voiceGroup: form.voiceGroup || "ELIKUREN",
            audioType: form.audioType,
            accessScope: form.accessScope,
            concertId: form.concertId,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          toast.error(err.detail ?? "Audio konnte nicht angelegt werden");
          return;
        }
        toast.success("Audio angelegt");
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
      const res = await fetch(`/api/admin/audio/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          composer: form.composer.trim() || null,
          voiceGroup: form.voiceGroup || "ELIKUREN",
          audioType: form.audioType,
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
        title="Audiodateien"
        description="Übematerial einem Konzert zuordnen, hochladen und Metadaten bearbeiten."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Audio hochladen
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
          icon={FileAudio}
          title="Keine Audiodateien gefunden"
          description="Lade die erste Audiodatei über „Audio hochladen“ hoch."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Komponist</TableHead>
                <TableHead>Konzert</TableHead>
                <TableHead>Typ</TableHead>
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
                  <TableCell>{item.concert?.title ?? "—"}</TableCell>
                  <TableCell>{audioTypeLabel(item.audio_type)}</TableCell>
                  <TableCell>{besetzungLabel(item.voice_group)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
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
        title="Audio hochladen"
        description="Audiodatei hochladen, Konzert zuordnen und Metadaten setzen."
        submitLabel="Hochladen"
        loading={pending}
        onSubmit={createAudio}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-file">Audiodatei</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*,.mp3,.m4a,.wav"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <AudioFormFields
            form={form}
            onChange={setForm}
            concerts={concerts}
          />
        </div>
      </FormDrawer>

      <FormDrawer
        open={editTarget != null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Audio bearbeiten"
        description={
          editTarget ? audioTypeLabel(editTarget.audio_type) : undefined
        }
        loading={pending}
        onSubmit={saveEdit}
      >
        <AudioFormFields
          form={form}
          onChange={setForm}
          concerts={concerts}
        />
      </FormDrawer>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Audiodatei löschen?"
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
            const res = await fetch(`/api/admin/audio/${deleteTarget.id}`, {
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
    </div>
  );
}

function AudioFormFields({
  form,
  onChange,
  concerts,
}: {
  form: AudioForm;
  onChange: (next: AudioForm) => void;
  concerts: ConcertOption[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audio-concert">Konzert</Label>
        <select
          id="audio-concert"
          className={selectClass}
          value={form.concertId}
          onChange={(e) => onChange({ ...form, concertId: e.target.value })}
          required
        >
          <option value="">Konzert wählen…</option>
          {concerts.map((concert) => (
            <option key={concert.id} value={concert.id}>
              {concert.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audio-title">Titel</Label>
        <Input
          id="audio-title"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audio-composer">Komponist</Label>
        <Input
          id="audio-composer"
          value={form.composer}
          onChange={(e) => onChange({ ...form, composer: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audio-type">Typ</Label>
        <select
          id="audio-type"
          className={selectClass}
          value={form.audioType}
          onChange={(e) => onChange({ ...form, audioType: e.target.value })}
        >
          {AUDIO_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audio-voice">Besetzung</Label>
        <select
          id="audio-voice"
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
        <Label htmlFor="audio-scope">Zugriff</Label>
        <select
          id="audio-scope"
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
