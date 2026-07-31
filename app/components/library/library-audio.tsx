"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AudioRow = {
  id: string;
  audio_type: string;
  is_my_voice: boolean;
  stored_file_id: string;
  original_name: string;
  piece_id: string;
  piece_title: string;
  composer: string;
};

type Piece = {
  id: string;
  title: string;
  composer: string;
  audio_files: Array<{
    id: string;
    audio_type: string;
    is_my_voice: boolean;
    stored_file_id: string;
    original_name: string;
  }>;
};

export function LibraryAudio() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [q, setQ] = useState("");
  const [myVoiceOnly, setMyVoiceOnly] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(
          `/api/library/pieces${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        );
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { items: Piece[] };
        setPieces(data.items);
      } catch {
        toast.error("Audio konnte nicht geladen werden");
      }
    })();
  }, [q]);

  const rows = useMemo(() => {
    const list: AudioRow[] = [];
    for (const piece of pieces) {
      for (const audio of piece.audio_files) {
        list.push({
          ...audio,
          piece_id: piece.id,
          piece_title: piece.title,
          composer: piece.composer,
        });
      }
    }
    return myVoiceOnly ? list.filter((row) => row.is_my_voice) : list;
  }, [pieces, myVoiceOnly]);

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
          className="max-w-sm"
        />
        <label className="flex items-center gap-2 text-sm">
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
          className="w-full"
          src={activeUrl}
        />
      ) : null}
      {rows.length === 0 ? (
        <p className="text-sm text-[#5c574e]">Keine veröffentlichten Audios.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#C8A24D]/20 bg-white/70 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  <Link
                    href={`/library/pieces/${row.piece_id}`}
                    className="hover:underline"
                  >
                    {row.piece_title}
                  </Link>
                </p>
                <p className="text-sm text-[#5c574e]">
                  {row.composer} · {row.original_name} · {row.audio_type}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {row.is_my_voice ? (
                  <Badge variant="success">Meine Stimme</Badge>
                ) : null}
                <Button
                  size="sm"
                  variant={activeId === row.stored_file_id ? "secondary" : "default"}
                  onClick={() => void play(row.stored_file_id)}
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
