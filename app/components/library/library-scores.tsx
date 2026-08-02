"use client";

import { FileMusic } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ActiveConcertCard } from "@/components/app/active-concert-card";
import { EmptyState } from "@/components/app/empty-state";
import { PdfPreview } from "@/components/library/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ENSEMBLE_OPTIONS, besetzungLabel } from "@/lib/voice-options";

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
  year: number | null;
  location: string | null;
  items: ProgramItem[];
};

const selectClass =
  "flex h-10 rounded-xl border border-[#ebe4d8] bg-white px-3 py-2 text-sm text-[#1f1f23]";

const tabClass = (active: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
    active
      ? "bg-[#1f1f23] text-white"
      : "border border-[#ebe4d8] bg-white text-[#5c574e] hover:border-[#d9d2c4] hover:text-[#1f1f23]"
  }`;

export function LibraryScores() {
  const [tab, setTab] = useState<"current" | "catalog">("current");
  const [items, setItems] = useState<ScoreItem[]>([]);
  const [concert, setConcert] = useState<CurrentConcert | null>(null);
  const [concertLoading, setConcertLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [q, setQ] = useState("");
  const [ensemble, setEnsemble] = useState("");
  const [preview, setPreview] = useState<{
    fileId: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      setConcertLoading(true);
      try {
        const res = await fetch("/api/library/concerts?current=1");
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { concert: CurrentConcert | null };
        setConcert(data.concert);
      } catch {
        toast.error("Aktuelles Konzert konnte nicht geladen werden");
        setConcert(null);
      } finally {
        setConcertLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (tab !== "catalog") return;
    void (async () => {
      setCatalogLoading(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (ensemble) params.set("voiceGroup", ensemble);
        const qs = params.toString();
        const res = await fetch(`/api/library/scores${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { items: ScoreItem[] };
        setItems(data.items);
      } catch {
        toast.error("Noten konnten nicht geladen werden");
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, [tab, q, ensemble]);

  const programItems = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (concert?.items ?? []).filter((item) => {
      if (ensemble) {
        const casting = item.ensemble ?? "ELIKUREN";
        if (casting !== ensemble) return false;
      }
      if (!query) return true;
      const haystack = [
        item.title,
        item.sheet_file?.title,
        item.sheet_file?.composer,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [concert?.items, ensemble, q]);

  return (
    <div className="space-y-8">
      <ActiveConcertCard concert={concert} loading={concertLoading} />

      <section className="space-y-5">
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

        <div className="flex flex-wrap gap-3">
          <select
            className={selectClass}
            value={ensemble}
            onChange={(e) => setEnsemble(e.target.value)}
            aria-label="Besetzung"
          >
            {ENSEMBLE_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche Titel oder Komponist"
            className="max-w-sm border-[#ebe4d8] bg-white"
            aria-label="Suche"
          />
        </div>

        {tab === "current" ? (
          concertLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : !concert ? (
            <EmptyState
              icon={FileMusic}
              title="Kein Programm verfügbar"
              description="Wechsle zum Katalog, um alle veröffentlichten Noten zu durchsuchen."
            />
          ) : programItems.length === 0 ? (
            <EmptyState
              icon={FileMusic}
              title="Kein Programm"
              description={
                q.trim() || ensemble
                  ? "Keine Programmpunkte für diese Filter."
                  : "Für dieses Konzert sind noch keine Programmpunkte hinterlegt."
              }
            />
          ) : (
            <ul className="space-y-2">
              {programItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#ebe4d8] bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#1f1f23]">
                      {item.sort_order}. {item.title}
                    </p>
                    <p className="text-sm text-[#5c574e]">
                      {[
                        besetzungLabel(item.ensemble),
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
          )
        ) : catalogLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileMusic}
            title="Keine Noten"
            description={
              ensemble || q.trim()
                ? "Keine Noten für diese Filter."
                : "Es sind noch keine Noten veröffentlicht."
            }
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#ebe4d8] bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#1f1f23]">{item.title}</p>
                  <p className="text-sm text-[#5c574e]">
                    {[
                      item.composer || null,
                      besetzungLabel(item.voice_group),
                    ]
                      .filter(Boolean)
                      .join(" · ") || item.original_name}
                  </p>
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <PdfPreview
        open={Boolean(preview)}
        fileId={preview?.fileId ?? ""}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
