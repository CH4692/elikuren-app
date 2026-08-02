"use client";

import { Music2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export type AudioPreviewItem = {
  fileId: string;
  fileName: string;
  title: string;
  concert: string | null;
  voiceGroup: string | null;
  durationSeconds: number | null;
};

type AudioPreviewProps = {
  open: boolean;
  item: AudioPreviewItem | null;
  onOpenChange: (open: boolean) => void;
};

function formatDuration(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPreview({ open, item, onOpenChange }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function stopPlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  useEffect(() => {
    if (!open || !item?.fileId) {
      stopPlayback();
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);

    void (async () => {
      try {
        const res = await fetch(
          `/api/files/${item.fileId}/url?disposition=inline`,
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          throw new Error(body.detail ?? "Audio nicht verfügbar");
        }
        const data = (await res.json()) as { url: string };
        if (!cancelled) setUrl(data.url);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Fehler");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      stopPlayback();
    };
  }, [open, item?.fileId]);

  function handleOpenChange(next: boolean) {
    if (!next) stopPlayback();
    onOpenChange(next);
  }

  const durationLabel = formatDuration(item?.durationSeconds ?? null);
  const metaParts = [
    item?.fileName,
    item?.concert ? `Konzert: ${item.concert}` : null,
    item?.voiceGroup ? `Besetzung: ${item.voiceGroup}` : null,
    durationLabel ? `Dauer: ${durationLabel}` : null,
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden bg-white p-0 sm:max-w-lg">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader className="space-y-3 pr-8">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#C8A24D]/15 text-[#C8A24D]">
                <Music2 className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-2">
                <DialogTitle className="font-heading text-2xl font-semibold tracking-tight text-[#1f1f23]">
                  Audio anhören
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-1.5 text-sm text-[#5c574e]">
                    {item?.title ? (
                      <p className="font-medium text-[#3f3a34]">{item.title}</p>
                    ) : null}
                    <dl className="grid gap-1">
                      {item?.fileName ? (
                        <div className="flex gap-2">
                          <dt className="shrink-0 text-[#8a8478]">Datei</dt>
                          <dd className="min-w-0 truncate">{item.fileName}</dd>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-[#8a8478]">Konzert</dt>
                        <dd className="min-w-0 truncate">
                          {item?.concert ?? "—"}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-[#8a8478]">Besetzung</dt>
                        <dd className="min-w-0 truncate">
                          {item?.voiceGroup ?? "—"}
                        </dd>
                      </div>
                      {durationLabel ? (
                        <div className="flex gap-2">
                          <dt className="shrink-0 text-[#8a8478]">Dauer</dt>
                          <dd className="tabular-nums">{durationLabel}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <span className="sr-only">{metaParts.join(". ")}</span>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-2xl border border-[#ebe4d8] bg-[#f7f4ee] px-4 py-5">
            {loading ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : url ? (
              <audio
                ref={audioRef}
                key={url}
                controls
                preload="metadata"
                className="w-full"
                src={url}
              >
                Dein Browser unterstützt die Audio-Wiedergabe nicht.
              </audio>
            ) : (
              <p className="text-sm text-[#8a8478]">Keine Vorschau verfügbar.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
