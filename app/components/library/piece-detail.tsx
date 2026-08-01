"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PdfPreview } from "@/components/library/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Piece = {
  id: string;
  title: string;
  composer: string;
  arranger: string | null;
  rehearsal_status: string;
  rehearsal_notes: string | null;
  description: string | null;
  sheet_files: Array<{
    id: string;
    sheet_type: string;
    is_my_voice: boolean;
    stored_file_id: string;
    original_name: string;
    version: string;
  }>;
  audio_files: Array<{
    id: string;
    audio_type: string;
    is_my_voice: boolean;
    stored_file_id: string;
    original_name: string;
  }>;
};

export function PieceDetail({ pieceId }: { pieceId: string }) {
  const [piece, setPiece] = useState<Piece | null>(null);
  const [preview, setPreview] = useState<{
    fileId: string;
    title: string;
  } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/library/pieces/${pieceId}`);
        if (!res.ok) throw new Error("not found");
        setPiece((await res.json()) as Piece);
      } catch {
        toast.error("Stück nicht gefunden");
      }
    })();
  }, [pieceId]);

  if (!piece) {
    return <p className="text-sm text-[#5c574e]">Laden …</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{piece.title}</h1>
        <p className="text-[#5c574e]">
          {piece.composer}
          {piece.arranger ? ` · Arr. ${piece.arranger}` : ""}
        </p>
        {piece.rehearsal_notes ? (
          <p className="mt-3 whitespace-pre-wrap text-sm">{piece.rehearsal_notes}</p>
        ) : null}
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Noten</h2>
        {piece.sheet_files.length === 0 ? (
          <p className="text-sm text-[#5c574e]">Keine Noten verfügbar.</p>
        ) : (
          <ul className="space-y-2">
            {piece.sheet_files.map((sheet) => (
              <li
                key={sheet.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 ${
                  sheet.is_my_voice
                    ? "border-[#C8A24D]/60 bg-[#C8A24D]/10"
                    : "border-[#C8A24D]/20 bg-white/70"
                }`}
              >
                <div>
                  <p className="font-medium">{sheet.original_name}</p>
                  <p className="text-sm text-[#5c574e]">
                    {sheet.sheet_type} · v{sheet.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {sheet.is_my_voice ? (
                    <Badge variant="success">Meine Stimme</Badge>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() =>
                      setPreview({
                        fileId: sheet.stored_file_id,
                        title: sheet.original_name,
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
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Audio</h2>
        {audioUrl ? (
          <audio key={audioUrl} controls autoPlay className="w-full" src={audioUrl} />
        ) : null}
        {piece.audio_files.length === 0 ? (
          <p className="text-sm text-[#5c574e]">Keine Audios verfügbar.</p>
        ) : (
          <ul className="space-y-2">
            {piece.audio_files.map((audio) => (
              <li
                key={audio.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 ${
                  audio.is_my_voice
                    ? "border-[#C8A24D]/60 bg-[#C8A24D]/10"
                    : "border-[#C8A24D]/20 bg-white/70"
                }`}
              >
                <div>
                  <p className="font-medium">{audio.original_name}</p>
                  <p className="text-sm text-[#5c574e]">{audio.audio_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {audio.is_my_voice ? (
                    <Badge variant="success">Meine Stimme</Badge>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => {
                      void (async () => {
                        const res = await fetch(
                          `/api/files/${audio.stored_file_id}/url?disposition=inline`,
                        );
                        if (!res.ok) {
                          toast.error("Audio nicht verfügbar");
                          return;
                        }
                        const data = (await res.json()) as { url: string };
                        setAudioUrl(data.url);
                      })();
                    }}
                  >
                    Abspielen
                  </Button>
                </div>
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
