import { z } from "zod";

/** Known internal App Router paths (no anchors). */
export const INTERNAL_SITE_ROUTES = [
  "/home",
  "/about",
  "/chorleitung",
  "/history",
  "/proben",
  "/contact",
  "/ensembles/elikuren",
  "/ensembles/eight-to-the-bar",
  "/ensembles/musical-team",
  "/impressum",
  "/datenschutz",
  "/auth/sign-in",
  "/auth/sign-up",
] as const;

/** Known in-app anchors (path + hash). */
export const INTERNAL_SITE_ANCHORS = [
  "/home#concerts",
  "/home#joinus",
  "/home#landing",
  "/home#chorleitung",
  "/home#support",
] as const;

const INTERNAL_ROUTE_SET = new Set<string>(INTERNAL_SITE_ROUTES);
const INTERNAL_ANCHOR_SET = new Set<string>(INTERNAL_SITE_ANCHORS);

export type SiteLinkOptions = {
  /** Allow mailto: URLs (default false). */
  allowMailto?: boolean;
  /** Only allow https:// URLs (no internal routes). */
  httpsOnly?: boolean;
};

export type SiteLinkValidation =
  | { ok: true; value: string }
  | { ok: false; error: string };

function normalizeCandidate(raw: string): string {
  return raw.trim();
}

/**
 * Validates CMS link destinations.
 * - Internal routes from allowlist
 * - Known anchors from allowlist
 * - https:// external URLs
 * - mailto: only when explicitly allowed
 * - Rejects javascript:, data:, and other unknown schemes
 */
export function validateSiteLink(
  raw: string,
  options: SiteLinkOptions = {},
): SiteLinkValidation {
  const value = normalizeCandidate(raw);
  if (!value) {
    return { ok: false, error: "Link darf nicht leer sein" };
  }

  const lower = value.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return { ok: false, error: "Unsicheres Link-Schema ist nicht erlaubt" };
  }

  if (options.httpsOnly) {
    if (lower.startsWith("http://")) {
      return {
        ok: false,
        error: "http://-Links sind nicht erlaubt (nutze https://)",
      };
    }
    if (!lower.startsWith("https://")) {
      return { ok: false, error: "Nur https://-Links sind erlaubt" };
    }
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        return { ok: false, error: "Nur https://-Links sind erlaubt" };
      }
      return { ok: true, value };
    } catch {
      return { ok: false, error: "Ungültige https://-URL" };
    }
  }

  if (lower.startsWith("mailto:")) {
    if (!options.allowMailto) {
      return { ok: false, error: "mailto:-Links sind hier nicht erlaubt" };
    }
    const address = value.slice("mailto:".length).trim();
    if (!address || !address.includes("@")) {
      return { ok: false, error: "Ungültige mailto:-Adresse" };
    }
    return { ok: true, value };
  }

  if (lower.startsWith("https://")) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        return { ok: false, error: "Nur https://-Links sind erlaubt" };
      }
      return { ok: true, value };
    } catch {
      return { ok: false, error: "Ungültige https://-URL" };
    }
  }

  if (lower.startsWith("http://")) {
    return { ok: false, error: "http://-Links sind nicht erlaubt (nutze https://)" };
  }

  // Scheme present but not allowed
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return { ok: false, error: "Unbekanntes oder unerlaubtes Link-Schema" };
  }

  // Internal path or path#anchor
  if (!value.startsWith("/")) {
    return { ok: false, error: "Interne Links müssen mit / beginnen" };
  }

  if (value.includes("#")) {
    if (!INTERNAL_ANCHOR_SET.has(value)) {
      return { ok: false, error: `Unbekannter Anker-Link: ${value}` };
    }
    return { ok: true, value };
  }

  if (!INTERNAL_ROUTE_SET.has(value)) {
    return { ok: false, error: `Unbekannte interne Route: ${value}` };
  }
  return { ok: true, value };
}

export function isAllowedInternalRoute(path: string): boolean {
  return INTERNAL_ROUTE_SET.has(path);
}

export function isAllowedInternalAnchor(pathWithHash: string): boolean {
  return INTERNAL_ANCHOR_SET.has(pathWithHash);
}

/** Zod helper for CMS link fields. */
export function siteLinkZod(options: SiteLinkOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    const result = validateSiteLink(value, options);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", message: result.error });
    }
  });
}
