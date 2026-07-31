import { randomUUID } from "node:crypto";

import type {
  FileAccessScope,
  Role,
  StoredFileCategory,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { hasPermission } from "@/lib/permissions";
import { buildObjectKey } from "@/lib/r2";

export const MAX_SHEET_BYTES = 50 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
export const MAX_INVOICE_BYTES = 30 * 1024 * 1024;

const ALLOWED: Record<
  StoredFileCategory,
  { mime: string[]; ext: string[]; maxBytes: number }
> = {
  SHEET: {
    mime: ["application/pdf"],
    ext: [".pdf"],
    maxBytes: MAX_SHEET_BYTES,
  },
  AUDIO: {
    mime: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/mp3"],
    ext: [".mp3", ".m4a", ".wav"],
    maxBytes: MAX_AUDIO_BYTES,
  },
  INVOICE: {
    mime: ["application/pdf", "image/jpeg", "image/png"],
    ext: [".pdf", ".jpg", ".jpeg", ".png"],
    maxBytes: MAX_INVOICE_BYTES,
  },
  ANNOUNCEMENT: {
    mime: ["application/pdf", "image/jpeg", "image/png"],
    ext: [".pdf", ".jpg", ".jpeg", ".png"],
    maxBytes: MAX_INVOICE_BYTES,
  },
  OTHER: {
    mime: ["application/pdf"],
    ext: [".pdf"],
    maxBytes: MAX_SHEET_BYTES,
  },
};

export function validateUploadInput(input: {
  category: StoredFileCategory;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}): { ok: true; extension: string } | { ok: false; error: string } {
  const rules = ALLOWED[input.category];
  const lower = input.originalName.toLowerCase();
  const extension = rules.ext.find((ext) => lower.endsWith(ext));
  if (!extension) {
    return { ok: false, error: "Dateityp nicht erlaubt" };
  }
  if (!rules.mime.includes(input.mimeType)) {
    return { ok: false, error: "MIME-Type nicht erlaubt" };
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > rules.maxBytes) {
    return { ok: false, error: "Dateigröße ungültig oder zu groß" };
  }
  return { ok: true, extension };
}

export function objectKeyFor(input: {
  category: StoredFileCategory;
  pieceId?: string;
  invoiceId?: string;
  announcementId?: string;
  fileId?: string;
  extension: string;
}): string {
  const fileId = input.fileId ?? randomUUID();
  const ext = input.extension.replace(/^\./, "");
  if (input.category === "SHEET" && input.pieceId) {
    return buildObjectKey([
      "pieces",
      input.pieceId,
      "sheets",
      `${fileId}.${ext}`,
    ]);
  }
  if (input.category === "AUDIO" && input.pieceId) {
    return buildObjectKey([
      "pieces",
      input.pieceId,
      "audio",
      `${fileId}.${ext}`,
    ]);
  }
  if (input.category === "INVOICE" && input.invoiceId) {
    return buildObjectKey([
      "invoices",
      input.invoiceId,
      `${fileId}.${ext}`,
    ]);
  }
  if (input.category === "ANNOUNCEMENT" && input.announcementId) {
    return buildObjectKey([
      "announcements",
      input.announcementId,
      `${fileId}.${ext}`,
    ]);
  }
  return buildObjectKey(["other", `${fileId}.${ext}`]);
}

export function normalizeVoiceLabel(
  voice: string | null | undefined,
): VoiceGroup | null {
  if (!voice) return null;
  const v = voice.trim().toLowerCase();
  if (v.startsWith("sop")) return "SOPRANO";
  if (v.startsWith("alt")) return "ALTO";
  if (v.startsWith("ten")) return "TENOR";
  if (v.startsWith("bas")) return "BASS";
  return "OTHER";
}

export function canAccessScopedFile(input: {
  accessScope: FileAccessScope;
  fileVoiceGroup: VoiceGroup | null;
  userRole: Role | string;
  userVoice: string | null;
}): boolean {
  if (input.accessScope === "ADMIN_ONLY") {
    return hasPermission(input.userRole, "PIECE_MANAGE");
  }
  if (input.accessScope === "VOICE_GROUP_ONLY") {
    if (hasPermission(input.userRole, "PIECE_MANAGE")) return true;
    if (!input.fileVoiceGroup) return false;
    return normalizeVoiceLabel(input.userVoice) === input.fileVoiceGroup;
  }
  return true;
}
