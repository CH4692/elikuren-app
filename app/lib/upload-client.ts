"use client";

/** Browser-side controlled Presigned-PUT upload against our APIs. */
export async function uploadFileViaPresign(input: {
  file: File;
  category: "SHEET" | "AUDIO" | "INVOICE" | "OTHER";
  pieceId?: string;
  invoiceId?: string;
}): Promise<{ fileId: string }> {
  const intentRes = await fetch("/api/admin/files/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: input.category,
      originalName: input.file.name,
      mimeType: input.file.type || guessMime(input.file.name),
      sizeBytes: input.file.size,
      pieceId: input.pieceId,
      invoiceId: input.invoiceId,
    }),
  });

  if (!intentRes.ok) {
    const err = (await intentRes.json().catch(() => ({}))) as {
      detail?: string;
    };
    throw new Error(err.detail ?? "Upload-Vorbereitung fehlgeschlagen");
  }

  const intent = (await intentRes.json()) as {
    fileId: string;
    uploadUrl: string;
    headers: Record<string, string>;
  };

  const putRes = await fetch(intent.uploadUrl, {
    method: "PUT",
    headers: intent.headers,
    body: input.file,
  });
  if (!putRes.ok) {
    throw new Error("Upload zu R2 fehlgeschlagen");
  }

  const completeRes = await fetch(`/api/files/${intent.fileId}/complete`, {
    method: "POST",
  });
  if (!completeRes.ok) {
    const err = (await completeRes.json().catch(() => ({}))) as {
      detail?: string;
    };
    throw new Error(err.detail ?? "Upload-Bestätigung fehlgeschlagen");
  }

  return { fileId: intent.fileId };
}

function guessMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
