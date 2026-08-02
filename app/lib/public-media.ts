/**
 * PUBLIC media strategy (binding):
 * - Objects live under R2 prefix `public/…` with StoredFile.visibility = PUBLIC.
 * - Durable URL = `{R2_PUBLIC_BASE_URL}/{objectKey}` (no signed URLs).
 * - MEMBERS / ADMIN files stay private and use signed URLs only.
 */

export const PUBLIC_OBJECT_PREFIX = "public/";

export function isPublicObjectKey(objectKey: string): boolean {
  return objectKey.startsWith(PUBLIC_OBJECT_PREFIX);
}

export function r2PublicBaseUrl(): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  return base || null;
}

export function publicObjectUrl(objectKey: string): string | null {
  if (!isPublicObjectKey(objectKey)) return null;
  const base = r2PublicBaseUrl();
  if (!base) return null;
  return `${base}/${objectKey.replace(/^\/+/, "")}`;
}

/** Image alt for public rendering. Decorative → empty string. */
export function resolveMediaAlt(input: {
  isDecorative: boolean;
  altText: string;
  title?: string;
}): string {
  if (input.isDecorative) return "";
  const alt = input.altText.trim();
  if (alt) return alt;
  return input.title?.trim() || "";
}

export function assertMediaAltValid(input: {
  isDecorative: boolean;
  altText: string;
}): void {
  if (input.isDecorative) return;
  if (!input.altText.trim()) {
    throw new Error("altText ist Pflicht, außer das Bild ist dekorativ");
  }
}
