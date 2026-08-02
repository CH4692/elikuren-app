"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type PdfPreviewProps = {
  fileId: string;
  title: string;
  open: boolean;
  onClose: () => void;
};

const toolbarBtnClass =
  "text-[#f4f1eb] hover:bg-white/10 hover:text-white";

export function PdfPreview({ fileId, title, open, onClose }: PdfPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  async function downloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/files/${fileId}/url?disposition=attachment`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { url: string };
      window.open(data.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1f1f23] text-[#f4f1eb]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="min-w-0 truncate text-base font-semibold">{title}</h2>
        <div className="flex shrink-0 items-center gap-1.5">
          {url ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={toolbarBtnClass}
              disabled={downloading}
              onClick={() => void downloadPdf()}
            >
              <Download />
              Herunterladen
            </Button>
          ) : null}
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className={toolbarBtnClass}
            onClick={onClose}
            aria-label="Schließen"
          >
            <X />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-[#0f0f11] p-3">
        <div className="h-full overflow-hidden rounded-xl bg-white shadow-lg">
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
    </div>
  );
}
