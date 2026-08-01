"use client";

import Link from "next/link";
import { ExternalLink, Music2, Upload } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
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

type PieceListItem = {
  id: string;
  title: string;
  composer: string;
  rehearsal_status: string;
  sheet_files: unknown[];
  audio_files: unknown[];
  updated_at: string;
};

const NEW_PIECE = "__new__";

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

function detectKind(file: File): "sheet" | "audio" | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "sheet";
  if (
    mime.startsWith("audio/") ||
    name.endsWith(".mp3") ||
    name.endsWith(".m4a") ||
    name.endsWith(".wav")
  ) {
    return "audio";
  }
  return null;
}

export function PiecesPanel() {
  const [items, setItems] = useState<PieceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const [file, setFile] = useState<File | null>(null);
  const [pieceChoice, setPieceChoice] = useState(NEW_PIECE);
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [voiceGroup, setVoiceGroup] = useState("");
  const [sheetType, setSheetType] = useState("CHOIR_SCORE");
  const [audioType, setAudioType] = useState("REHEARSAL");
  const [accessScope, setAccessScope] = useState("ALL_MEMBERS");

  const kind = useMemo(() => (file ? detectKind(file) : null), [file]);
  const creatingNew = pieceChoice === NEW_PIECE;

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pieces");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: PieceListItem[] };
      setItems(data.items);
    } catch {
      toast.error("Stücke konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setFile(null);
    setPieceChoice(NEW_PIECE);
    setTitle("");
    setComposer("");
    setVoiceGroup("");
    setSheetType("CHOIR_SCORE");
    setAudioType("REHEARSAL");
    setAccessScope("ALL_MEMBERS");
  }

  function submitUpload() {
    startTransition(async () => {
      if (!file) {
        toast.error("Bitte eine Datei wählen");
        return;
      }
      const detected = detectKind(file);
      if (!detected) {
        toast.error("Nur PDF- oder Audiodateien sind erlaubt");
        return;
      }
      if (creatingNew && !title.trim()) {
        toast.error("Titel ist Pflicht für ein neues Stück");
        return;
      }

      try {
        const { fileId } = await uploadFileViaPresign({
          file,
          category: detected === "sheet" ? "SHEET" : "AUDIO",
          pieceId: creatingNew ? undefined : pieceChoice,
        });

        const body: Record<string, unknown> = {
          storedFileId: fileId,
          kind: detected,
          voiceGroup: voiceGroup || null,
          accessScope,
        };
        if (creatingNew) {
          body.title = title.trim();
          body.composer = composer.trim() || undefined;
        } else {
          body.pieceId = pieceChoice;
        }
        if (detected === "sheet") body.sheetType = sheetType;
        else body.audioType = audioType;

        const res = await fetch("/api/admin/library/attach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          throw new Error(err.detail ?? "Zuordnung fehlgeschlagen");
        }

        toast.success("Datei hochgeladen und zugeordnet");
        resetForm();
        await load();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Upload fehlgeschlagen",
        );
      }
    });
  }

  return (
    <div>
      <PageHeader
        title="Stücke"
        description="Dateien hochladen und einem bestehenden Stück zuordnen oder ein neues Stück anlegen."
      />

      <div className="mb-6 space-y-4 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[#2c2925]">
          <Upload className="size-4" />
          Datei hochladen
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="library-file">Datei (PDF oder Audio)</Label>
            <Input
              id="library-file"
              type="file"
              accept="application/pdf,.pdf,audio/mpeg,audio/mp4,audio/wav,.mp3,.m4a,.wav"
              disabled={pending}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && kind == null ? (
              <p className="text-xs text-red-700">
                Dateityp nicht erkannt — bitte PDF oder Audio wählen.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="piece-choice">Stück</Label>
            <select
              id="piece-choice"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={pieceChoice}
              disabled={pending}
              onChange={(e) => setPieceChoice(e.target.value)}
            >
              <option value={NEW_PIECE}>Neues Stück anlegen</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                  {item.composer ? ` — ${item.composer}` : ""}
                </option>
              ))}
            </select>
          </div>

          {creatingNew ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="piece-title">Titel</Label>
                <Input
                  id="piece-title"
                  value={title}
                  disabled={pending}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z. B. Ave Maria"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="piece-composer">Komponist (optional)</Label>
                <Input
                  id="piece-composer"
                  value={composer}
                  disabled={pending}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="z. B. Schubert"
                />
              </div>
            </>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="voice-group">Stimme (optional)</Label>
            <select
              id="voice-group"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={voiceGroup}
              disabled={pending}
              onChange={(e) => setVoiceGroup(e.target.value)}
            >
              {VOICE_GROUPS.map((v) => (
                <option key={v.value || "none"} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {kind === "sheet" || (kind == null && !file) ? (
            <div className="space-y-1.5">
              <Label htmlFor="sheet-type">Notentyp (optional)</Label>
              <select
                id="sheet-type"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={sheetType}
                disabled={pending}
                onChange={(e) => setSheetType(e.target.value)}
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
          ) : null}

          {kind === "audio" ? (
            <div className="space-y-1.5">
              <Label htmlFor="audio-type">Audiotyp (optional)</Label>
              <select
                id="audio-type"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={audioType}
                disabled={pending}
                onChange={(e) => setAudioType(e.target.value)}
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
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="access-scope">Zugriff</Label>
            <select
              id="access-scope"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={accessScope}
              disabled={pending}
              onChange={(e) => setAccessScope(e.target.value)}
            >
              {ACCESS_SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="button" disabled={pending} onClick={submitUpload}>
          <Upload className="size-4" />
          Hochladen
        </Button>
      </div>

      <DataTableToolbar />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="Noch keine Stücke"
          description="Lade die erste Datei hoch, um ein Stück anzulegen."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Komponist</TableHead>
                <TableHead>Noten</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.composer || "—"}</TableCell>
                  <TableCell>{item.sheet_files.length}</TableCell>
                  <TableCell>{item.audio_files.length}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-[#d9d2c4]"
                      asChild
                    >
                      <Link href={`/admin/pieces/${item.id}`}>
                        <ExternalLink className="size-3.5" />
                        Öffnen
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
