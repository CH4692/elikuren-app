"use client";

import { Headphones } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AUDIO_TYPE_OPTIONS as AUDIO_TYPE_BASE,
  LIBRARY_VOICE_LABELS as VOICE_LABELS,
} from "@/lib/voice-options";

type AudioItem = {
  id: string;
  title: string;
  composer: string;
  audio_type: string;
  voice_group: string | null;
  is_my_voice: boolean;
  stored_file_id: string;
  original_name: string;
  concert_id: string | null;
  concert_title: string | null;
};

type ConcertRow = {
  id: string;
  title: string;
  date: string | null;
  is_current: boolean;
  recording_count: number;
};

const AUDIO_TYPE_OPTIONS = [
  { value: "", label: "Alle Typen" },
  ...AUDIO_TYPE_BASE.filter((o) => o.value !== "CONCERT_RECORDING"),
] as const;

const selectClass =
  "flex h-10 rounded-xl border border-[#ebe4d8] bg-white/80 px-3 py-2 text-sm text-[#1f1f23]";

const tabClass = (active: boolean) =>
  `rounded-full px-3 py-1.5 text-sm transition ${
    active
      ? "bg-[#1f1f23] text-white"
      : "bg-white/80 text-[#5c574e] border border-[#ebe4d8]"
  }`;

function audioTypeLabel(value: string) {
  return (
    AUDIO_TYPE_BASE.find((o) => o.value === value)?.label ?? value
  );
}

export function LibraryAudio() {
  const [tab, setTab] = useState<"practice" | "concerts">("practice");
  const [items, setItems] = useState<AudioItem[]>([]);
  const [concerts, setConcerts] = useState<ConcertRow[]>([]);
  const [selectedConcertId, setSelectedConcertId] = useState<string>("");
  const [q, setQ] = useState("");
  const [myVoiceOnly, setMyVoiceOnly] = useState(false);
  const [audioType, setAudioType] = useState("");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        if (tab === "concerts" && !selectedConcertId) {
          const res = await fetch("/api/library/concerts");
          if (!res.ok) throw new Error("load failed");
          const data = (await res.json()) as { items: ConcertRow[] };
          setConcerts(data.items);
          return;
        }

        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (myVoiceOnly) params.set("myVoice", "1");
        if (tab === "practice") {
          params.set("section", "practice");
          if (audioType) params.set("type", audioType);
        } else {
          params.set("section", "concerts");
          if (selectedConcertId) params.set("concertId", selectedConcertId);
        }
        const qs = params.toString();
        const res = await fetch(`/api/library/audio${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { items: AudioItem[] };
        setItems(data.items);
      } catch {
        toast.error("Audio konnte nicht geladen werden");
      }
    })();
  }, [tab, q, myVoiceOnly, audioType, selectedConcertId]);

  const practiceGroups = useMemo(() => {
    if (tab !== "practice") return [];
    const map = new Map<string, AudioItem[]>();
    for (const item of items) {
      const key = item.title.trim() || item.original_name;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [items, tab]);

  async function play(fileId: string) {
    const res = await fetch(`/api/files/${fileId}/url?disposition=inline`);
    if (!res.ok) {
      toast.error("Audio-URL nicht verfügbar");
      return;
    }
    const data = (await res.json()) as { url: string };
    setActiveUrl(data.url);
    setActiveId(fileId);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={tabClass(tab === "practice")}
          onClick={() => {
            setTab("practice");
            setSelectedConcertId("");
            setItems([]);
          }}
        >
          Üben
        </button>
        <button
          type="button"
          className={tabClass(tab === "concerts")}
          onClick={() => {
            setTab("concerts");
            setSelectedConcertId("");
            setItems([]);
          }}
        >
          Konzerte
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche Titel oder Komponist"
          className="max-w-sm border-[#ebe4d8] bg-white/80"
        />
        {tab === "practice" ? (
          <>
            <select
              className={selectClass}
              value={audioType}
              onChange={(e) => setAudioType(e.target.value)}
              aria-label="Audio-Typ"
            >
              {AUDIO_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-[#5c574e]">
              <input
                type="checkbox"
                checked={myVoiceOnly}
                onChange={(e) => setMyVoiceOnly(e.target.checked)}
              />
              Meine Stimme
            </label>
          </>
        ) : null}
      </div>

      {activeUrl ? (
        <audio
          key={activeUrl}
          controls
          autoPlay
          className="w-full rounded-xl border border-[#ebe4d8] bg-white/80 p-2"
          src={activeUrl}
        />
      ) : null}

      {tab === "concerts" && !selectedConcertId ? (
        concerts.length === 0 ? (
          <EmptyState
            icon={Headphones}
            title="Keine Konzerte"
            description="Sobald Konzerte angelegt sind, erscheinen Mitschnitte hier."
          />
        ) : (
          <ul className="space-y-2">
            {concerts.map((concert) => (
              <li
                key={concert.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ebe4d8] bg-white/80 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#1f1f23]">{concert.title}</p>
                  <p className="text-sm text-[#5c574e]">
                    {[
                      concert.date,
                      `${concert.recording_count} Mitschnitte`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {concert.is_current ? (
                    <Badge variant="success">Aktuell</Badge>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => setSelectedConcertId(concert.id)}
                  >
                    Öffnen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "concerts" && selectedConcertId ? (
        <div className="space-y-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedConcertId("");
              setItems([]);
            }}
          >
            ← Alle Konzerte
          </Button>
          {items.length === 0 ? (
            <EmptyState
              icon={Headphones}
              title="Keine Mitschnitte"
              description="Für dieses Konzert sind noch keine Aufnahmen verknüpft."
            />
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <AudioRow
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  onPlay={play}
                  showType
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "practice" ? (
        practiceGroups.length === 0 ? (
          <EmptyState
            icon={Headphones}
            title="Kein Übematerial"
            description={
              myVoiceOnly
                ? "Für deine Stimme ist noch kein Übematerial veröffentlicht."
                : "Es ist noch kein Übematerial veröffentlicht."
            }
          />
        ) : (
          <ul className="space-y-4">
            {practiceGroups.map(([title, tracks]) => (
              <li
                key={title}
                className="rounded-lg border border-[#ebe4d8] bg-white/80 px-4 py-3"
              >
                <p className="mb-2 font-medium text-[#1f1f23]">{title}</p>
                <ul className="space-y-2">
                  {tracks.map((item) => (
                    <AudioRow
                      key={item.id}
                      item={item}
                      activeId={activeId}
                      onPlay={play}
                      compact
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

function AudioRow({
  item,
  activeId,
  onPlay,
  showType,
  compact,
}: {
  item: AudioItem;
  activeId: string | null;
  onPlay: (fileId: string) => void;
  showType?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center justify-between gap-2"
          : "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ebe4d8] bg-white/80 px-4 py-3"
      }
    >
      <div>
        {!compact ? (
          <p className="font-medium text-[#1f1f23]">{item.title}</p>
        ) : null}
        <p className={`text-sm text-[#5c574e] ${compact ? "" : ""}`}>
          {[
            compact ? null : item.composer || null,
            showType ? audioTypeLabel(item.audio_type) : null,
            item.voice_group
              ? (VOICE_LABELS[item.voice_group] ?? item.voice_group)
              : null,
            item.concert_title,
          ]
            .filter(Boolean)
            .join(" · ") || (compact ? "Spur" : item.original_name)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {item.is_my_voice ? <Badge variant="success">Meine Stimme</Badge> : null}
        <Button
          size="sm"
          variant={activeId === item.stored_file_id ? "secondary" : "default"}
          onClick={() => void onPlay(item.stored_file_id)}
        >
          Abspielen
        </Button>
      </div>
    </div>
  );
}
