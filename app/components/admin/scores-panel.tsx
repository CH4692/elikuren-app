"use client";

import Link from "next/link";
import { ExternalLink, FileMusic, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/app/confirm-dialog";
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

type ScoreItem = {
  id: string;
  piece_id: string;
  piece_title: string;
  piece_composer: string;
  sheet_type: string;
  voice_group: string | null;
  access_scope: string;
  version: number;
  is_visible: boolean;
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

export function ScoresPanel() {
  const [items, setItems] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<ScoreItem | null>(null);

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
  }, []);

  return (
    <div>
      <PageHeader
        title="Noten & PDFs"
        description="Übersicht aller Noten. Anlegen und bearbeiten über Stücke → Stück-Editor."
        actions={
          <Button type="button" asChild>
            <Link href="/admin/pieces">Zu den Stücken</Link>
          </Button>
        }
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
          icon={FileMusic}
          title="Keine Noten gefunden"
          description="Lade Noten über den Stück-Editor hoch."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datei</TableHead>
                <TableHead>Stück</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Stimme</TableHead>
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
                  <TableCell>{item.sheet_type}</TableCell>
                  <TableCell>{item.voice_group ?? "—"}</TableCell>
                  <TableCell>
                    {formatBytes(item.stored_file.size_bytes)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Note löschen?"
        description={
          deleteTarget
            ? `„${deleteTarget.stored_file.original_name}“ wird entfernt.`
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
    </div>
  );
}
