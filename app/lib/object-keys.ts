import { randomUUID } from "node:crypto";

import type { StoredFileCategory } from "@/lib/generated/prisma/client";
import { buildObjectKey } from "@/lib/r2";

export type AudioObjectKind = "practice" | "concerts" | "other";

export type ObjectKeyInput = {
  category: StoredFileCategory;
  extension: string;
  /** Prefer StoredFile.id so key and DB stay aligned. */
  fileId?: string;
  invoiceId?: string;
  concertId?: string | null;
  audioKind?: AudioObjectKind;
  /**
   * Website / CDN assets: object key under `public/…`
   * (StoredFile.visibility must be PUBLIC).
   */
  publicWebsite?: boolean;
  /** Defaults to now (UTC). */
  at?: Date;
};

function ym(at: Date) {
  const y = at.getUTCFullYear();
  const m = String(at.getUTCMonth() + 1).padStart(2, "0");
  return { y: String(y), m };
}

/**
 * Canonical R2 key layout for Elikuren.
 *
 * library/sheets/{yyyy}/{mm}/{id}.ext
 * library/audio/practice|other/{yyyy}/{mm}/{id}.ext
 * library/audio/concerts/{concertId}/{id}.ext
 * finance/invoices/{yyyy}/{invoiceId}/{id}.ext
 * public/site/images/{yyyy}/{mm}/{id}.ext   (PUBLIC website images)
 * site/images/{yyyy}/{mm}/{id}.ext          (private IMAGE; signed URL only)
 * trash/{yyyy-mm-dd}/{id}.ext
 */
export function objectKeyFor(input: ObjectKeyInput): string {
  const fileId = input.fileId ?? randomUUID();
  const ext = input.extension.replace(/^\./, "").toLowerCase();
  const at = input.at ?? new Date();
  const { y, m } = ym(at);
  const fileName = `${fileId}.${ext}`;

  if (input.category === "SHEET") {
    return buildObjectKey(["library", "sheets", y, m, fileName]);
  }

  if (input.category === "AUDIO") {
    const kind = input.audioKind ?? (input.concertId ? "concerts" : "practice");
    if (kind === "concerts" && input.concertId) {
      return buildObjectKey([
        "library",
        "audio",
        "concerts",
        input.concertId,
        fileName,
      ]);
    }
    if (kind === "concerts") {
      // Concert not known yet — park under other until linked in DB.
      return buildObjectKey(["library", "audio", "other", y, m, fileName]);
    }
    return buildObjectKey(["library", "audio", kind, y, m, fileName]);
  }

  if (input.category === "INVOICE") {
    const invoiceId = input.invoiceId?.trim() || "unassigned";
    return buildObjectKey(["finance", "invoices", y, invoiceId, fileName]);
  }

  if (input.category === "IMAGE") {
    if (input.publicWebsite) {
      return buildObjectKey(["public", "site", "images", y, m, fileName]);
    }
    return buildObjectKey(["site", "images", y, m, fileName]);
  }

  // Misc / fallback
  return buildObjectKey(["site", "other", y, m, fileName]);
}

export function trashObjectKey(input: {
  fileId: string;
  extension: string;
  deletedAt?: Date;
}): string {
  const at = input.deletedAt ?? new Date();
  const day = at.toISOString().slice(0, 10);
  const ext = input.extension.replace(/^\./, "").toLowerCase();
  return buildObjectKey(["trash", day, `${input.fileId}.${ext}`]);
}

export function audioKindFromType(
  audioType: string | null | undefined,
): AudioObjectKind {
  if (audioType === "CONCERT_RECORDING") return "concerts";
  if (
    audioType === "REHEARSAL" ||
    audioType === "SOPRANO" ||
    audioType === "ALTO" ||
    audioType === "TENOR" ||
    audioType === "BASS" ||
    audioType === "PIANO" ||
    audioType === "FULL_RECORDING"
  ) {
    return "practice";
  }
  return "other";
}
