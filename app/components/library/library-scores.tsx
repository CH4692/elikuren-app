"use client";

import { FileMusic } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { PdfPreview } from "@/components/library/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ScoreItem = {
  id: string;
  title: string;
  composer: string;
  voice_group: string | null;
  is_my_voice: boolean;
  stored_file_id: string;
  original_name: string;
};

const VOICE_LABELS: Record<string, string> = {
  SOPRANO: "Sopran",
  ALTO: "Alt",
  TENOR: "Tenor",
  BASS: "Bass",
  OTHER: "Sonstige",
};

export function LibraryScores() {
  const [items, setItems] = useState<ScoreItem[]>([]);
  const [q, setQ] = useState("");
  const [myVoiceOnly, setMyVoiceOnly] = useState(false);
  const [preview, setPreview] = useState<{
    fileId: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (myVoiceOnly) params.set("myVoice", "1");
        const qs = params.toString();
        const res = await fetch(`/api/library/scores${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { items: ScoreItem[] };
        setItems(data.items);
      } catch {
        toast.error("Noten konnten nicht geladen werden");
      }
    })();
  }, [q, myVoiceOnly]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche Titel oder Komponist"
          className="max-w-sm border-[#ebe4d8] bg-white/80"
        />
        <label className="flex items-center gap-2 text-sm text-[#5c574e]">
          <input
            type="checkbox"
            checked={myVoiceOnly}
            onChange={(e) => setMyVoiceOnly(e.target.checked)}
          />
          Meine Stimme
        </label>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={FileMusic}
          title="Keine Noten"
          description={
            myVoiceOnly
              ? "Für deine Stimme sind noch keine Noten veröffentlicht."
              : "Es sind noch keine Noten veröffentlicht."
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ebe4d8] bg-white/80 px-4 py-3"
            >
              <div>
                <p className="font-medium text-[#1f1f23]">{item.title}</p>
                <p className="text-sm text-[#5c574e]">
                  {[
                    item.composer || null,
                    item.voice_group
                      ? (VOICE_LABELS[item.voice_group] ?? item.voice_group)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || item.original_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.is_my_voice ? (
                  <Badge variant="success">Meine Stimme</Badge>
                ) : null}
                <Button
                  size="sm"
                  onClick={() =>
                    setPreview({
                      fileId: item.stored_file_id,
                      title: item.title,
                    })
                  }
                >
                  Vorschau
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <PdfPreview
        open={Boolean(preview)}
        fileId={preview?.fileId ?? ""}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
