"use client";

import Link from "next/link";
import { ExternalLink, FileAudio } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AudioItem = {
  id: string;
  piece_id: string;
  piece_title: string;
  piece_composer: string;
  audio_type: string;
  voice_group: string | null;
  access_scope: string;
  duration_seconds: number | null;
  published_at: string | null;
  stored_file: {
    id: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    upload_status: string;
  };
  updated_at: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioFilesPanel() {
  const [items, setItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
  }, []);

  return (
    <div>
      <PageHeader
        title="Audiodateien"
        description="Alle hochgeladenen Audiodateien über alle Stücke hinweg."
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Stück, Komponist, Dateiname…"
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
          description="Lade Audio über den Stück-Editor hoch."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datei</TableHead>
                <TableHead>Stück</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Dauer</TableHead>
                <TableHead>Größe</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.stored_file.original_name}
                  </TableCell>
                  <TableCell>
                    <div>{item.piece_title}</div>
                    <div className="text-xs text-[#5c574e]">
                      {item.piece_composer}
                    </div>
                  </TableCell>
                  <TableCell>{item.audio_type}</TableCell>
                  <TableCell>{formatDuration(item.duration_seconds)}</TableCell>
                  <TableCell>
                    {formatBytes(item.stored_file.size_bytes)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-[#d9d2c4]"
                      asChild
                    >
                      <Link href={`/admin/pieces/${item.piece_id}`}>
                        <ExternalLink className="size-3.5" />
                        Stück
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
