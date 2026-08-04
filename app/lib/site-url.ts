/**
 * Production-like environments must configure an absolute site origin.
 * Vercel Preview uses VERCEL_ENV=preview (NODE_ENV is still "production").
 */
export function isProductionEnv(): boolean {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === "production";
  }
  return process.env.NODE_ENV === "production";
}

function normalizeAbsoluteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid site URL (not a valid absolute URL): ${raw}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid site URL protocol (expected http/https): ${parsed.protocol}`,
    );
  }
  // Drop path/query/hash — base origin only
  return `${parsed.protocol}//${parsed.host}`;
}

/**
 * Canonical absolute site origin for server-side email/links.
 * Priority: SITE_URL → AUTH_URL → NEXT_PUBLIC_SITE_URL → localhost (non-production only).
 */
export function getSiteUrl(): string {
  const configured =
    process.env.SITE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  if (configured) {
    return normalizeAbsoluteUrl(configured);
  }

  if (!isProductionEnv()) {
    return "http://localhost:3000";
  }

  throw new Error(
    "Missing site URL configuration: set SITE_URL, AUTH_URL, or NEXT_PUBLIC_SITE_URL for production.",
  );
}

/** Join site origin with a path without duplicate slashes. */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const trimmed = path.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
  return `${base}/${trimmed}`;
}
