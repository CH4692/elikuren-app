"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
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
      setTitle("");
      setComposer("");
      window.location.href = `/admin/pieces/${created.id}`;
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Neues Stück</CardTitle>
          <CardDescription>
            Neue Inhalte starten als Entwurf und werden erst nach bewusster
            Veröffentlichung für Mitglieder sichtbar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="piece-title">Titel</Label>
            <Input
              id="piece-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Ave Maria"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="piece-composer">Komponist</Label>
            <Input
              id="piece-composer"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="z. B. Schubert"
            />
          </div>
          <div className="flex items-end">
            <Button
              disabled={pending || !title.trim() || !composer.trim()}
              onClick={createPiece}
            >
              Entwurf anlegen
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Alle Stücke</h2>
        {loading ? (
          <p className="text-sm text-[#5c574e]">Laden …</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#5c574e]">Noch keine Stücke vorhanden.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/pieces/${item.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#C8A24D]/25 bg-white/70 px-4 py-3 transition hover:border-[#C8A24D]/60"
                >
                  <div>
                    <p className="font-medium text-[#1F1F23]">{item.title}</p>
                    <p className="text-sm text-[#5c574e]">{item.composer}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5c574e]">
                    {statusBadge(item.publication_status)}
                    <span>
                      {item.sheet_files.length} Noten · {item.audio_files.length}{" "}
                      Audio
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
