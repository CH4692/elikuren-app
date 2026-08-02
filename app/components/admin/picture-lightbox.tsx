"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type LightboxPicture = {
  id: string;
  title: string;
  caption: string | null;
  taken_at: string | null;
  stored_file_id: string;
  original_name: string;
};

type PictureLightboxProps = {
  open: boolean;
  items: LightboxPicture[];
  index: number;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
};

export function PictureLightbox({
  open,
  items,
  index,
  onIndexChange,
  onOpenChange,
}: PictureLightboxProps) {
  const item = items[index] ?? null;
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) {
      setUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const fileId = item.stored_file_id;
    setUrl(null);
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch(
          `/api/files/${fileId}/url?disposition=inline`,
        );
        if (!res.ok) throw new Error("Bild-URL nicht verfügbar");
        const data = (await res.json()) as { url: string };
        if (!cancelled) setUrl(data.url);
      } catch (err) {
        if (!cancelled) {
          setUrl(null);
          setError(err instanceof Error ? err.message : "Fehler");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, item?.stored_file_id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onIndexChange((index - 1 + items.length) % items.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onIndexChange((index + 1) % items.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, items.length, onIndexChange]);

  const meta = item
    ? [item.taken_at, item.original_name].filter(Boolean).join(" · ")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(92dvh,920px)] w-[min(96vw,1100px)] max-w-none flex-col gap-0 overflow-hidden border-0 bg-[#1f1f23] p-0 text-[#f4f1eb] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <DialogTitle className="truncate text-base font-semibold text-[#f4f1eb]">
              {item?.title ?? "Bild"}
            </DialogTitle>
            <DialogDescription className="truncate text-xs text-[#f4f1eb]/60">
              {meta || "Vorschau"}
              {items.length > 1 ? ` · ${index + 1} / ${items.length}` : ""}
            </DialogDescription>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-[#f4f1eb] hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Schließen"
          >
            <X />
          </Button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black/40 px-12 py-4">
          {items.length > 1 ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-[#f4f1eb] hover:bg-white/10"
                onClick={() =>
                  onIndexChange((index - 1 + items.length) % items.length)
                }
                aria-label="Vorheriges Bild"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[#f4f1eb] hover:bg-white/10"
                onClick={() => onIndexChange((index + 1) % items.length)}
                aria-label="Nächstes Bild"
              >
                <ChevronRight />
              </Button>
            </>
          ) : null}

          {loading ? (
            <p className="text-sm text-[#f4f1eb]/70">Lädt…</p>
          ) : error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={item?.title ?? ""}
              className="max-h-full max-w-full object-contain"
              style={{ imageOrientation: "from-image" }}
            />
          ) : null}
        </div>

        {item?.caption ? (
          <p className="border-t border-white/10 px-4 py-3 text-sm text-[#f4f1eb]/75">
            {item.caption}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
