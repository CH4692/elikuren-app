"use client";

import { Headphones } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AudioItem = {
  id: string;
  title: string;
  composer: string;
  audio_type: string;
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

const AUDIO_TYPE_OPTIONS = [
  { value: "", label: "Alle Typen" },
  { value: "FULL_RECORDING", label: "Gesamtaufnahme" },
  { value: "SOPRANO", label: "Sopran" },
  { value: "ALTO", label: "Alt" },
  { value: "TENOR", label: "Tenor" },
  { value: "BASS", label: "Bass" },
  { value: "PIANO", label: "Klavier" },
  { value: "REHEARSAL", label: "Probe" },
  { value: "PRONUNCIATION", label: "Aussprache" },
  { value: "CONCERT_RECORDING", label: "Konzert" },
  { value: "OTHER", label: "Sonstige" },
] as const;

const selectClass =
  "flex h-10 rounded-xl border border-[#ebe4d8] bg-white/80 px-3 py-2 text-sm text-[#1f1f23]";

function audioTypeLabel(value: string) {
  return (
    AUDIO_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}

export function LibraryAudio() {
  const [items, setItems] = useState<AudioItem[]>([]);
  const [q, setQ] = useState("");
  const [myVoiceOnly, setMyVoiceOnly] = useState(false);
  const [audioType, setAudioType] = useState("");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (myVoiceOnly) params.set("myVoice", "1");
        if (audioType) params.set("type", audioType);
        const qs = params.toString();
        const res = await fetch(`/api/library/audio${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { items: AudioItem[] };
        setItems(data.items);
      } catch {
        toast.error("Audio konnte nicht geladen werden");
      }
    })();
  }, [q, myVoiceOnly, audioType]);

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
      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche Titel oder Komponist"
          className="max-w-sm border-[#ebe4d8] bg-white/80"
        />
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
      {items.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="Kein Audio"
          description={
            myVoiceOnly
              ? "Für deine Stimme ist noch kein Übematerial veröffentlicht."
              : "Es ist noch kein Übematerial veröffentlicht."
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
                    audioTypeLabel(item.audio_type),
                    item.voice_group
                      ? (VOICE_LABELS[item.voice_group] ?? item.voice_group)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.is_my_voice ? (
                  <Badge variant="success">Meine Stimme</Badge>
                ) : null}
                <Button
                  size="sm"
                  variant={
                    activeId === item.stored_file_id ? "secondary" : "default"
                  }
                  onClick={() => void play(item.stored_file_id)}
                >
                  Abspielen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
