"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PdfPreview } from "@/components/library/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Sheet = {
  id: string;
  sheet_type: string;
  voice_group: string | null;
  version: string;
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
  sheet_files: Array<{
    id: string;
    sheet_type: string;
    voice_group: string | null;
    version: string;
    is_my_voice: boolean;
    stored_file_id: string;
    original_name: string;
  }>;
};

export function LibraryScores() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [q, setQ] = useState("");
  const [myVoiceOnly, setMyVoiceOnly] = useState(false);
  const [preview, setPreview] = useState<{
    fileId: string;
    title: string;
  } | null>(null);

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
        toast.error("Noten konnten nicht geladen werden");
      }
    })();
  }, [q]);

  const sheets = useMemo(() => {
    const rows: Sheet[] = [];
    for (const piece of pieces) {
      for (const sheet of piece.sheet_files) {
        rows.push({
          ...sheet,
          piece_id: piece.id,
          piece_title: piece.title,
          composer: piece.composer,
        });
      }
    }
    return myVoiceOnly ? rows.filter((row) => row.is_my_voice) : rows;
  }, [pieces, myVoiceOnly]);

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
      {sheets.length === 0 ? (
        <p className="text-sm text-[#5c574e]">Keine veröffentlichten Noten.</p>
      ) : (
        <ul className="space-y-2">
          {sheets.map((sheet) => (
            <li
              key={sheet.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#C8A24D]/20 bg-white/70 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  <Link
                    href={`/library/pieces/${sheet.piece_id}`}
                    className="hover:underline"
                  >
                    {sheet.piece_title}
                  </Link>
                </p>
                <p className="text-sm text-[#5c574e]">
                  {sheet.composer} · {sheet.original_name} · v{sheet.version}
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
      <PdfPreview
        open={Boolean(preview)}
        fileId={preview?.fileId ?? ""}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
