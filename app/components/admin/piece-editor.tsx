"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileViaPresign } from "@/lib/upload-client";

type Piece = {
  id: string;
  title: string;
  composer: string;
  arranger: string | null;
  category: string | null;
  epoch: string | null;
  instrumentation: string | null;
  difficulty: string | null;
  rehearsal_status: "PLANNED" | "REHEARSING" | "PERFORMANCE_READY" | "ARCHIVED";
  publication_status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  rehearsal_notes: string | null;
  description: string | null;
  sheet_files: Array<{
    id: string;
    sheet_type: string;
    voice_group: string | null;
    access_scope: string;
    version: string;
    published_at: string | null;
    stored_file: {
      id: string;
      original_name: string;
      upload_status: string;
    };
  }>;
  audio_files: Array<{
    id: string;
    audio_type: string;
    voice_group: string | null;
    access_scope: string;
    published_at: string | null;
    stored_file: {
      id: string;
      original_name: string;
      upload_status: string;
    };
  }>;
};

const ACCESS_SCOPES = [
  { value: "ALL_MEMBERS", label: "Alle Mitglieder" },
  { value: "VOICE_GROUP_ONLY", label: "Nur Stimmgruppe" },
  { value: "ADMIN_ONLY", label: "Nur Admin" },
] as const;

const VOICE_GROUPS = [
  { value: "", label: "—" },
  { value: "SOPRANO", label: "Sopran" },
  { value: "ALTO", label: "Alt" },
  { value: "TENOR", label: "Tenor" },
  { value: "BASS", label: "Bass" },
  { value: "OTHER", label: "Sonstige" },
] as const;

export function PieceEditor({ pieceId }: { pieceId: string }) {
  const [piece, setPiece] = useState<Piece | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [sheetMeta, setSheetMeta] = useState({
    sheetType: "CHOIR_SCORE",
    voiceGroup: "",
    accessScope: "ALL_MEMBERS",
    publish: false,
  });
  const [audioMeta, setAudioMeta] = useState({
    audioType: "REHEARSAL",
    voiceGroup: "",
    accessScope: "ALL_MEMBERS",
    publish: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pieces/${pieceId}`);
      if (!res.ok) throw new Error("load failed");
      setPiece((await res.json()) as Piece);
    } catch {
      toast.error("Stück konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [pieceId]);

  useEffect(() => {
    void load();
  }, [load]);

  function saveMeta() {
    if (!piece) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/pieces/${piece.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: piece.title,
          composer: piece.composer,
          arranger: piece.arranger,
          category: piece.category,
          epoch: piece.epoch,
          instrumentation: piece.instrumentation,
          difficulty: piece.difficulty,
          rehearsalNotes: piece.rehearsal_notes,
          description: piece.description,
          rehearsalStatus: piece.rehearsal_status,
        }),
      });
      if (!res.ok) {
        toast.error("Speichern fehlgeschlagen");
        return;
      }
      setPiece((await res.json()) as Piece);
      toast.success("Gespeichert");
    });
  }

  function setPublication(status: Piece["publication_status"]) {
    if (!piece) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/pieces/${piece.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicationStatus: status }),
      });
      if (!res.ok) {
        toast.error("Statusänderung fehlgeschlagen");
        return;
      }
      setPiece((await res.json()) as Piece);
      toast.success(
        status === "PUBLISHED"
          ? "Stück veröffentlicht"
          : status === "DRAFT"
            ? "Als Entwurf zurückgesetzt"
            : "Archiviert",
      );
    });
  }

  function uploadSheet(file: File | null) {
    if (!file || !piece) return;
    startTransition(async () => {
      try {
        const { fileId } = await uploadFileViaPresign({
          file,
          category: "SHEET",
          pieceId: piece.id,
        });
        const res = await fetch(`/api/admin/pieces/${piece.id}/sheets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storedFileId: fileId,
            sheetType: sheetMeta.sheetType,
            voiceGroup: sheetMeta.voiceGroup || null,
            accessScope: sheetMeta.accessScope,
            publish: sheetMeta.publish,
          }),
        });
        if (!res.ok) throw new Error("attach failed");
        setPiece((await res.json()) as Piece);
        toast.success("Notendatei hochgeladen");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Upload fehlgeschlagen",
        );
      }
    });
  }

  function uploadAudio(file: File | null) {
    if (!file || !piece) return;
    startTransition(async () => {
      try {
        const { fileId } = await uploadFileViaPresign({
          file,
          category: "AUDIO",
          pieceId: piece.id,
        });
        const res = await fetch(`/api/admin/pieces/${piece.id}/audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storedFileId: fileId,
            audioType: audioMeta.audioType,
            voiceGroup: audioMeta.voiceGroup || null,
            accessScope: audioMeta.accessScope,
            publish: audioMeta.publish,
          }),
        });
        if (!res.ok) throw new Error("attach failed");
        setPiece((await res.json()) as Piece);
        toast.success("Audiodatei hochgeladen");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Upload fehlgeschlagen",
        );
      }
    });
  }

  async function toggleSheetPublish(id: string, publish: boolean) {
    const res = await fetch(`/api/admin/sheets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(publish ? { publish: true } : { unpublish: true }),
    });
    if (!res.ok) {
      toast.error("Aktualisierung fehlgeschlagen");
      return;
    }
    await load();
  }

  async function toggleAudioPublish(id: string, publish: boolean) {
    const res = await fetch(`/api/admin/audio/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(publish ? { publish: true } : { unpublish: true }),
    });
    if (!res.ok) {
      toast.error("Aktualisierung fehlgeschlagen");
      return;
    }
    await load();
  }

  if (loading || !piece) {
    return <p className="text-sm text-[#5c574e]">Laden …</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/pieces"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ← Zurück zur Übersicht
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {piece.title}
          </h1>
          <p className="text-[#5c574e]">{piece.composer}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {piece.publication_status === "PUBLISHED" ? (
            <Badge variant="success">Veröffentlicht</Badge>
          ) : piece.publication_status === "ARCHIVED" ? (
            <Badge variant="danger">Archiviert</Badge>
          ) : (
            <Badge variant="warning">Entwurf</Badge>
          )}
          {piece.publication_status !== "PUBLISHED" ? (
            <Button disabled={pending} onClick={() => setPublication("PUBLISHED")}>
              Stück veröffentlichen
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setPublication("DRAFT")}
            >
              Zurück zu Entwurf
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>
            Änderungen bleiben Entwurf, bis das Stück veröffentlicht ist.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Titel</Label>
            <Input
              value={piece.title}
              onChange={(e) => setPiece({ ...piece, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Komponist</Label>
            <Input
              value={piece.composer}
              onChange={(e) => setPiece({ ...piece, composer: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Arrangeur</Label>
            <Input
              value={piece.arranger ?? ""}
              onChange={(e) =>
                setPiece({ ...piece, arranger: e.target.value || null })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Probenstatus</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={piece.rehearsal_status}
              onChange={(e) =>
                setPiece({
                  ...piece,
                  rehearsal_status: e.target
                    .value as Piece["rehearsal_status"],
                })
              }
            >
              <option value="PLANNED">Geplant</option>
              <option value="REHEARSING">In Probe</option>
              <option value="PERFORMANCE_READY">Aufführungsreif</option>
              <option value="ARCHIVED">Archiviert</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Probenhinweise</Label>
            <Textarea
              value={piece.rehearsal_notes ?? ""}
              onChange={(e) =>
                setPiece({ ...piece, rehearsal_notes: e.target.value || null })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Button disabled={pending} onClick={saveMeta}>
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Noten (PDF)</CardTitle>
          <CardDescription>
            Upload über Presigned PUT zu R2. Dateien sind erst nach
            Veröffentlichung sichtbar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Typ</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={sheetMeta.sheetType}
                onChange={(e) =>
                  setSheetMeta({ ...sheetMeta, sheetType: e.target.value })
                }
              >
                <option value="FULL_SCORE">Partitur</option>
                <option value="CHOIR_SCORE">Chorpartitur</option>
                <option value="SOPRANO">Sopran</option>
                <option value="ALTO">Alt</option>
                <option value="TENOR">Tenor</option>
                <option value="BASS">Bass</option>
                <option value="PIANO">Klavier</option>
                <option value="OTHER">Sonstiges</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Stimmgruppe</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={sheetMeta.voiceGroup}
                onChange={(e) =>
                  setSheetMeta({ ...sheetMeta, voiceGroup: e.target.value })
                }
              >
                {VOICE_GROUPS.map((v) => (
                  <option key={v.value || "none"} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Zugriff</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={sheetMeta.accessScope}
                onChange={(e) =>
                  setSheetMeta({ ...sheetMeta, accessScope: e.target.value })
                }
              >
                {ACCESS_SCOPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={sheetMeta.publish}
                onChange={(e) =>
                  setSheetMeta({ ...sheetMeta, publish: e.target.checked })
                }
              />
              Sofort veröffentlichen
            </label>
          </div>
          <Input
            type="file"
            accept="application/pdf,.pdf"
            disabled={pending}
            onChange={(e) => uploadSheet(e.target.files?.[0] ?? null)}
          />
          <ul className="space-y-2">
            {piece.sheet_files.map((sheet) => (
              <li
                key={sheet.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {sheet.stored_file.original_name}
                  </p>
                  <p className="text-[#5c574e]">
                    {sheet.sheet_type} · {sheet.access_scope} · v{sheet.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {sheet.published_at ? (
                    <Badge variant="success">Datei live</Badge>
                  ) : (
                    <Badge variant="warning">Datei Entwurf</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void toggleSheetPublish(sheet.id, !sheet.published_at)
                    }
                  >
                    {sheet.published_at ? "Zurückziehen" : "Veröffentlichen"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audio</CardTitle>
          <CardDescription>MP3/M4A/WAV über denselben R2-Flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Typ</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={audioMeta.audioType}
                onChange={(e) =>
                  setAudioMeta({ ...audioMeta, audioType: e.target.value })
                }
              >
                <option value="FULL_RECORDING">Gesamtaufnahme</option>
                <option value="SOPRANO">Sopran</option>
                <option value="ALTO">Alt</option>
                <option value="TENOR">Tenor</option>
                <option value="BASS">Bass</option>
                <option value="PIANO">Klavier</option>
                <option value="REHEARSAL">Probe</option>
                <option value="PRONUNCIATION">Aussprache</option>
                <option value="CONCERT_RECORDING">Konzert</option>
                <option value="OTHER">Sonstiges</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Stimmgruppe</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={audioMeta.voiceGroup}
                onChange={(e) =>
                  setAudioMeta({ ...audioMeta, voiceGroup: e.target.value })
                }
              >
                {VOICE_GROUPS.map((v) => (
                  <option key={v.value || "none"} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Zugriff</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={audioMeta.accessScope}
                onChange={(e) =>
                  setAudioMeta({ ...audioMeta, accessScope: e.target.value })
                }
              >
                {ACCESS_SCOPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={audioMeta.publish}
                onChange={(e) =>
                  setAudioMeta({ ...audioMeta, publish: e.target.checked })
                }
              />
              Sofort veröffentlichen
            </label>
          </div>
          <Input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav,.mp3,.m4a,.wav"
            disabled={pending}
            onChange={(e) => uploadAudio(e.target.files?.[0] ?? null)}
          />
          <ul className="space-y-2">
            {piece.audio_files.map((audio) => (
              <li
                key={audio.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {audio.stored_file.original_name}
                  </p>
                  <p className="text-[#5c574e]">
                    {audio.audio_type} · {audio.access_scope}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {audio.published_at ? (
                    <Badge variant="success">Datei live</Badge>
                  ) : (
                    <Badge variant="warning">Datei Entwurf</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void toggleAudioPublish(audio.id, !audio.published_at)
                    }
                  >
                    {audio.published_at ? "Zurückziehen" : "Veröffentlichen"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
