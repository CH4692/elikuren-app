"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type PdfPreviewProps = {
  fileId: string;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function PdfPreview({ fileId, title, open, onClose }: PdfPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadUrl() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files/${fileId}/url?disposition=inline`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(body.detail ?? "Vorschau nicht verfügbar");
      }
      const data = (await res.json()) as { url: string; expiresIn: number };
      setUrl(data.url);
      setExpiresIn(data.expiresIn);
    } catch (err) {
      setUrl(null);
      setError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fileId]);

  useEffect(() => {
    if (!open || !expiresIn) return;
    const refreshMs = Math.max((expiresIn - 30) * 1000, 15_000);
    const timer = window.setTimeout(() => {
      void loadUrl();
    }, refreshMs);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expiresIn, url]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1F1F23]/95 p-3 text-[#F4F1EB]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          {url ? (
            <Button
              variant="outline"
              onClick={() => {
                void (async () => {
                  const res = await fetch(
                    `/api/files/${fileId}/url?disposition=attachment`,
                  );
                  if (!res.ok) return;
                  const data = (await res.json()) as { url: string };
                  window.open(data.url, "_blank", "noopener,noreferrer");
                })();
              }}
            >
              Download
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg bg-white">
        {loading ? (
          <p className="p-6 text-sm text-[#5c574e]">Lade PDF …</p>
        ) : error ? (
          <div className="space-y-3 p-6 text-sm text-[#5c574e]">
            <p>{error}</p>
            <Button onClick={() => void loadUrl()}>Erneut versuchen</Button>
          </div>
        ) : url ? (
          <iframe title={title} src={url} className="h-full w-full border-0" />
        ) : null}
      </div>
    </div>
  );
}
