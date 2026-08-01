"use client";

import Link from "next/link";
import { ExternalLink, Music2, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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

type PieceListItem = {
  id: string;
  title: string;
  composer: string;
  publication_status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  rehearsal_status: string;
  sheet_files: unknown[];
  audio_files: unknown[];
  updated_at: string;
};

function statusBadge(status: PieceListItem["publication_status"]) {
  if (status === "PUBLISHED") return <Badge variant="success">Veröffentlicht</Badge>;
  if (status === "ARCHIVED") return <Badge variant="danger">Archiviert</Badge>;
  return <Badge variant="warning">Entwurf</Badge>;
}

export function PiecesPanel() {
  const [items, setItems] = useState<PieceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");

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

  function createPiece() {
    startTransition(async () => {
      const res = await fetch("/api/admin/pieces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, composer }),
      });
      if (!res.ok) {
        toast.error("Stück konnte nicht angelegt werden");
        return;
      }
      const created = (await res.json()) as PieceListItem;
      toast.success("Entwurf angelegt");
      setDrawerOpen(false);
      setTitle("");
      setComposer("");
      window.location.href = `/admin/pieces/${created.id}`;
    });
  }

  return (
    <div>
      <PageHeader
        title="Stücke"
        description="Neue Inhalte starten als Entwurf und werden erst nach bewusster Veröffentlichung sichtbar."
        actions={
          <Button type="button" onClick={() => setDrawerOpen(true)}>
            <Plus className="size-4" />
            Neues Stück
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
          icon={Music2}
          title="Noch keine Stücke"
          description="Lege das erste Stück als Entwurf an."
          action={
            <Button type="button" onClick={() => setDrawerOpen(true)}>
              Neues Stück
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Komponist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Noten</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.composer}</TableCell>
                  <TableCell>{statusBadge(item.publication_status)}</TableCell>
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

      <FormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setTitle("");
            setComposer("");
          }
        }}
        title="Neues Stück"
        description="Nach dem Anlegen wirst du zum Stück-Editor weitergeleitet."
        loading={pending}
        onSubmit={createPiece}
        submitLabel="Entwurf anlegen"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="piece-title">Titel</Label>
            <Input
              id="piece-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Ave Maria"
            />
          </div>
          <div>
            <Label htmlFor="piece-composer">Komponist</Label>
            <Input
              id="piece-composer"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="z. B. Schubert"
            />
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
