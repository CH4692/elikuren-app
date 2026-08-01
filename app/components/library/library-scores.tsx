"use client";

import { FileMusic } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { PdfPreview } from "@/components/library/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ENSEMBLE_LABELS,
  ENSEMBLE_OPTIONS,
  LIBRARY_VOICE_LABELS as VOICE_LABELS,
} from "@/lib/voice-options";

type ScoreItem = {
  id: string;
  title: string;
  composer: string;
  voice_group: string | null;
  is_my_voice: boolean;
  stored_file_id: string;
  original_name: string;
};

type ProgramItem = {
  id: string;
  sort_order: number;
  title: string;
  ensemble: string | null;
  sheet_file: {
    id: string;
    title: string;
    composer: string;
    voice_group: string | null;
    stored_file_id: string;
    original_name: string;
  } | null;
};

type CurrentConcert = {
  id: string;
  title: string;
  date: string | null;
  items: ProgramItem[];
};

const selectClass =
  "flex h-10 rounded-xl border border-[#ebe4d8] bg-white/80 px-3 py-2 text-sm text-[#1f1f23]";

const tabClass = (active: boolean) =>
  `rounded-full px-3 py-1.5 text-sm transition ${
    active
      ? "bg-[#1f1f23] text-white"
      : "bg-white/80 text-[#5c574e] border border-[#ebe4d8]"
  }`;

export function LibraryScores() {
  const [tab, setTab] = useState<"current" | "catalog">("current");
  const [items, setItems] = useState<ScoreItem[]>([]);
  const [concert, setConcert] = useState<CurrentConcert | null>(null);
  const [q, setQ] = useState("");
  const [myVoiceOnly, setMyVoiceOnly] = useState(false);
  const [ensemble, setEnsemble] = useState("");
  const [preview, setPreview] = useState<{
    fileId: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        if (tab === "current") {
          const res = await fetch("/api/library/concerts?current=1");
          if (!res.ok) throw new Error("load failed");
          const data = (await res.json()) as { concert: CurrentConcert | null };
          setConcert(data.concert);
          return;
        }
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
  }, [tab, q, myVoiceOnly]);

  const programItems = (concert?.items ?? []).filter((item) => {
    if (!ensemble) return true;
    return item.ensemble === ensemble || item.ensemble == null;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={tabClass(tab === "current")}
          onClick={() => setTab("current")}
        >
          Aktuelles Konzert
        </button>
        <button
          type="button"
          className={tabClass(tab === "catalog")}
          onClick={() => setTab("catalog")}
        >
          Katalog
        </button>
      </div>

      {tab === "current" ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className={selectClass}
              value={ensemble}
              onChange={(e) => setEnsemble(e.target.value)}
              aria-label="Ensemble"
            >
              {ENSEMBLE_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.value ? opt.label : "Alle Ensembles"}
                </option>
              ))}
            </select>
            {concert ? (
              <p className="text-sm text-[#5c574e]">
                {concert.title}
                {concert.date ? ` · ${concert.date}` : ""}
              </p>
            ) : null}
          </div>
          {!concert ? (
            <EmptyState
              icon={FileMusic}
              title="Kein aktuelles Konzert"
              description="Sobald ein Konzert als aktuell markiert ist, erscheint hier das Programm. Bis dahin nutze den Katalog."
            />
          ) : programItems.length === 0 ? (
            <EmptyState
              icon={FileMusic}
              title="Kein Programm"
              description="Für dieses Ensemble sind noch keine Programmpunkte hinterlegt."
            />
          ) : (
            <ul className="space-y-2">
              {programItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ebe4d8] bg-white/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#1f1f23]">
                      {item.sort_order}. {item.title}
                    </p>
                    <p className="text-sm text-[#5c574e]">
                      {[
                        item.ensemble
                          ? (ENSEMBLE_LABELS[item.ensemble] ?? item.ensemble)
                          : "Elikuren / alle",
                        item.sheet_file?.composer || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.sheet_file ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          setPreview({
                            fileId: item.sheet_file!.stored_file_id,
                            title: item.sheet_file!.title,
                          })
                        }
                      >
                        Vorschau
                      </Button>
                    ) : (
                      <Badge variant="warning">Keine Note</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
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
        </>
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
