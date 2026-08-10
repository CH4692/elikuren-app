export const GLOBAL_PAGE_KEY = "global" as const;

/** Public marketing pages (eligible for SEO + public routing). Not `global`. */
export const PUBLIC_SITE_PAGE_KEYS = [
  "home",
  "about",
  "chorleitung",
  "history",
  "proben",
  "contact",
  "ensemble_elikuren",
  "ensemble_eight",
  "ensemble_musical",
] as const;

export type PublicSitePageKey = (typeof PUBLIC_SITE_PAGE_KEYS)[number];
export type SitePageKey = PublicSitePageKey | typeof GLOBAL_PAGE_KEY;

export type SectionVisibilityMode = "fixed" | "toggleable";

export type SiteSectionDef = {
  key: string;
  label: string;
  visibilityMode: SectionVisibilityMode;
  /** Seed defaults; list items must use deterministic stable IDs. */
  defaults: Record<string, unknown>;
};

export type SitePageDef = {
  key: SitePageKey;
  title: string;
  description: string;
  /** Public preview path; null for config-only pages (global). */
  previewPath: string | null;
  sections: SiteSectionDef[];
};

export function isPublicSitePageKey(key: string): key is PublicSitePageKey {
  return (PUBLIC_SITE_PAGE_KEYS as readonly string[]).includes(key);
}

export function isGlobalPageKey(key: string): boolean {
  return key === GLOBAL_PAGE_KEY;
}

export function isKnownSitePageKey(key: string): key is SitePageKey {
  return isPublicSitePageKey(key) || isGlobalPageKey(key);
}

export function isFixedSectionDef(def: SiteSectionDef | null | undefined): boolean {
  return def?.visibilityMode === "fixed";
}

/** Effective public visibility: fixed sections always visible. */
export function isSectionEffectivelyVisible(
  visibilityMode: SectionVisibilityMode,
  isVisible: boolean,
): boolean {
  if (visibilityMode === "fixed") return true;
  return isVisible;
}

/** Enforce fixed sections stay visible on write. */
export function resolveSectionVisibility(
  visibilityMode: SectionVisibilityMode,
  requested?: boolean,
): boolean {
  if (visibilityMode === "fixed") return true;
  if (requested === undefined) return true;
  return requested;
}

export function computePageLastUpdated(input: {
  pageUpdatedAt: Date;
  sectionUpdatedAts: Date[];
}): Date {
  let max = input.pageUpdatedAt.getTime();
  for (const ts of input.sectionUpdatedAts) {
    const t = ts.getTime();
    if (t > max) max = t;
  }
  return new Date(max);
}

/** Public routes that consume global nav/footer/org (for cache invalidation). */
export const GLOBAL_CONSUMER_PATHS = [
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
] as const;

export function publicPathForPageKey(pageKey: PublicSitePageKey): string {
  switch (pageKey) {
    case "home":
      return "/home";
    case "about":
      return "/about";
    case "chorleitung":
      return "/chorleitung";
    case "history":
      return "/history";
    case "proben":
      return "/proben";
    case "contact":
      return "/contact";
    case "ensemble_elikuren":
      return "/ensembles/elikuren";
    case "ensemble_eight":
      return "/ensembles/eight-to-the-bar";
    case "ensemble_musical":
      return "/ensembles/musical-team";
    default: {
      const _exhaustive: never = pageKey;
      return _exhaustive;
    }
  }
}
