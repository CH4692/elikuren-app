"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { PictureThumb } from "@/components/admin/picture-thumb";
import { EmptyState } from "@/components/app/empty-state";
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
import { Skeleton } from "@/components/ui/skeleton";
import { uploadFileViaPresign } from "@/lib/upload-client";
import { ImageIcon } from "lucide-react";

export type CmsMediaPick = {
  id: string;
  title: string;
  alt_text: string;
  is_decorative: boolean;
  stored_file: { id: string };
};

type PictureItem = CmsMediaPick & {
  public_url: string | null;
};

export function CmsMediaPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: CmsMediaPick) => void;
}) {
  const [items, setItems] = useState<PictureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/pictures${params}`);
      if (!res.ok) {
        if (res.status === 403) {
          toast.error(
            "Keine Medienberechtigung. Bitte unter Medien Bilder hochladen.",
          );
          return;
        }
        throw new Error("load failed");
      }
      const data = (await res.json()) as { items: PictureItem[] };
      setItems(data.items);
    } catch {
      toast.error("Medien konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void load();
  }, [open]);

  function upload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      startTransition(async () => {
        try {
          const { fileId } = await uploadFileViaPresign({
            file,
            category: "IMAGE",
            publicWebsite: true,
          });
          const res = await fetch("/api/admin/pictures", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storedFileId: fileId,
              title: file.name.replace(/\.[^.]+$/, ""),
              altText: "",
              isDecorative: false,
            }),
          });
          if (!res.ok) {
            const err = (await res.json().catch(() => ({}))) as {
              detail?: string;
            };
            throw new Error(err.detail ?? "Anlegen fehlgeschlagen");
          }
          const created = (await res.json()) as PictureItem;
          toast.success("Bild hochgeladen");
          onSelect(created);
          onOpenChange(false);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Upload fehlgeschlagen",
          );
        }
      });
    };
    input.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bild auswählen</DialogTitle>
          <DialogDescription>
            Wähle ein Bild aus der Mediathek oder lade ein neues hoch.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            className="border-[#d9d2c4]"
            onClick={() => void load(search || undefined)}
          >
            Suchen
          </Button>
          <Button type="button" onClick={upload} disabled={pending}>
            Hochladen
          </Button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="aspect-square w-full" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Keine Bilder"
              description="Lade ein Bild hoch oder pflege die Mediathek unter Medien."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full overflow-hidden rounded-xl border border-[#d9d2c4] bg-white text-left transition hover:border-[#C8A24D]"
                    onClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                  >
                    <div className="aspect-square">
                      <PictureThumb
                        fileId={item.stored_file.id}
                        title={item.title}
                      />
                    </div>
                    <div className="truncate px-2 py-1.5 text-xs text-[#5c574e]">
                      {item.title}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
