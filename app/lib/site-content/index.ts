import type { Prisma } from "@/lib/generated/prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { prisma } from "@/lib/db";
import {
  revalidateSiteContent,
  sitePageCacheKey,
  sitePageCacheTag,
} from "@/lib/site-content/cache";
import {
  getSectionDef,
  getSitePageDef,
  previewPathForPageKey,
  SITE_PAGE_DEFS,
} from "@/lib/site-content/defaults";
import {
  assertStableListIdsPreserved,
  parseSectionData,
  SITE_SECTION_SCHEMAS,
} from "@/lib/site-content/schemas";
import { seedSiteContent as seedSiteContentDb } from "@/lib/site-content/seed";
import {
  computePageLastUpdated,
  GLOBAL_PAGE_KEY,
  isFixedSectionDef,
  isGlobalPageKey,
  isPublicSitePageKey,
  isSectionEffectivelyVisible,
  resolveSectionVisibility,
  type SectionVisibilityMode,
} from "@/lib/site-content/registry";

export {
  CONCERTS_PUBLIC_CACHE_TAG,
  revalidateGlobalSiteContent,
  revalidateSiteContent,
  sitePageCacheKey,
  sitePageCacheTag,
} from "@/lib/site-content/cache";
export {
  getGlobalSectionDefinition,
  getPublicSitePageDefinition,
  getSectionDef,
  getSitePageDef,
  getSitePageDefinition,
  isGlobalSectionKey,
  listGlobalSectionDefinitions,
  listPublicSitePageDefinitions,
  previewPathForPageKey,
  SITE_PAGE_DEFS,
  GLOBAL_SECTION_KEYS,
} from "@/lib/site-content/defaults";
export type {
  GlobalSectionDefinition,
  GlobalSectionKey,
  PublicSitePageDefinition,
} from "@/lib/site-content/defaults";
export {
  assertStableListIdsPreserved,
  getSectionSchema,
  parseSectionData,
  SITE_SECTION_SCHEMAS,
} from "@/lib/site-content/schemas";
export { seedSiteContent } from "@/lib/site-content/seed";
export {
  computePageLastUpdated,
  GLOBAL_CONSUMER_PATHS,
  GLOBAL_PAGE_KEY,
  isGlobalPageKey,
  isKnownSitePageKey,
  isPublicSitePageKey,
  PUBLIC_SITE_PAGE_KEYS,
  publicPathForPageKey,
} from "@/lib/site-content/registry";
export {
  INTERNAL_SITE_ANCHORS,
  INTERNAL_SITE_ROUTES,
  validateSiteLink,
} from "@/lib/site-content/links";

export type SiteSectionView = {
  id: string;
  key: string;
  isVisible: boolean;
  visibilityMode: SectionVisibilityMode;
  data: Record<string, unknown>;
  valid: boolean;
  error?: string;
  updatedAt: Date;
};

export type SitePageView = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageId: string | null;
  /** Public CDN object key when OG image is set; used by SEO. */
  ogImageObjectKey: string | null;
  updatedAt: Date;
  lastUpdated: Date;
  sections: SiteSectionView[];
};

export type AdminSiteSectionView = Omit<SiteSectionView, "error" | "updatedAt"> & {
  updated_at: string;
  is_visible: boolean;
  error: string | null;
};

export type AdminSitePageView = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_id: string | null;
  updated_at: string;
  last_updated: string;
  is_global: boolean;
  is_public_page: boolean;
  preview_path: string | null;
  sections: AdminSiteSectionView[];
};

type GlobalOrganization = {
  choirName: string;
  legalName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  registerNumber: string;
  boardLines: Array<{ id: string; text: string; sortOrder: number }>;
  contentResponsible: string;
};

async function loadSitePageUncached(
  pageKey: string,
): Promise<SitePageView | null> {
  const page = await prisma.sitePage.findUnique({
    where: { key: pageKey },
    include: {
      sections: true,
      ogImage: {
        select: {
          storedFile: { select: { objectKey: true } },
        },
      },
    },
  });
  if (!page) return null;

  const sections: SiteSectionView[] = page.sections.map((section) => {
    const def = getSectionDef(page.key, section.key);
    const visibilityMode = def?.visibilityMode ?? "toggleable";
    const parsed = parseSectionData(page.key, section.key, section.data);
    if (!parsed.ok) {
      console.error(
        `[site-content] invalid section ${page.key}/${section.key}: ${parsed.error}`,
      );
      return {
        id: section.id,
        key: section.key,
        isVisible: section.isVisible,
        visibilityMode,
        data: {},
        valid: false,
        error: parsed.error,
        updatedAt: section.updatedAt,
      };
    }
    return {
      id: section.id,
      key: section.key,
      isVisible: section.isVisible,
      visibilityMode,
      data: parsed.data,
      valid: true,
      updatedAt: section.updatedAt,
    };
  });

  const lastUpdated = computePageLastUpdated({
    pageUpdatedAt: page.updatedAt,
    sectionUpdatedAts: sections.map((s) => s.updatedAt),
  });

  return {
    id: page.id,
    key: page.key,
    title: page.title,
    description: page.description,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    ogImageId: page.ogImageId,
    ogImageObjectKey: page.ogImage?.storedFile?.objectKey ?? null,
    updatedAt: page.updatedAt,
    lastUpdated,
    sections,
  };
}

/**
 * Tagged cross-request cache for public CMS page payloads.
 * Admin reads must call loadSitePageUncached / getAdminSitePage instead.
 */
function loadPublicSitePageCached(pageKey: string) {
  return unstable_cache(
    () => loadSitePageUncached(pageKey),
    [sitePageCacheKey(pageKey)],
    { tags: [sitePageCacheTag(pageKey)] },
  )();
}

/**
 * Public page/global config load: request-deduped + tagged data cache.
 * Do not use from admin mutation paths.
 */
export const getPublicSitePage = cache(async (pageKey: string) => {
  return loadPublicSitePageCached(pageKey);
});

function toAdminPageView(page: SitePageView): AdminSitePageView {
  const def = getSitePageDef(page.key);
  return {
    id: page.id,
    key: page.key,
    // Registry is SSOT for admin labels; DB title may lag after renames.
    title: def?.title ?? page.title,
    description: page.description ?? def?.description ?? null,
    meta_title: page.metaTitle,
    meta_description: page.metaDescription,
    og_image_id: page.ogImageId,
    updated_at: page.updatedAt.toISOString(),
    last_updated: page.lastUpdated.toISOString(),
    is_global: isGlobalPageKey(page.key),
    is_public_page: isPublicSitePageKey(page.key),
    preview_path: previewPathForPageKey(page.key),
    sections: page.sections.map((section) => ({
      id: section.id,
      key: section.key,
      isVisible: section.isVisible,
      visibilityMode: section.visibilityMode,
      data: section.data,
      valid: section.valid,
      is_visible: section.isVisible,
      updated_at: section.updatedAt.toISOString(),
      error: section.error ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Public reads — never expose hidden sections
// ---------------------------------------------------------------------------

/**
 * Public: only valid + effectively visible sections (tagged cache via getPublicSitePage).
 */
export async function getPublicSiteSections(pageKey: string) {
  const page = await getPublicSitePage(pageKey);
  if (!page) return [];
  return page.sections.filter(
    (s) =>
      s.valid &&
      isSectionEffectivelyVisible(s.visibilityMode, s.isVisible),
  );
}

export async function getSectionDataPublic<T extends Record<string, unknown>>(
  pageKey: string,
  sectionKey: string,
): Promise<T | null> {
  const sections = await getPublicSiteSections(pageKey);
  const section = sections.find((s) => s.key === sectionKey);
  return (section?.data as T) ?? null;
}

export async function getGlobalOrganizationPublic(): Promise<GlobalOrganization | null> {
  const data = await getSectionDataPublic<GlobalOrganization>(
    GLOBAL_PAGE_KEY,
    "organization",
  );
  return data;
}

export async function getGlobalNavigationPublic() {
  return getSectionDataPublic<{
    items: Array<{
      id: string;
      label: string;
      href?: string;
      visible: boolean;
      sortOrder: number;
      children?: Array<{
        id: string;
        label: string;
        href: string;
        visible: boolean;
        sortOrder: number;
      }>;
    }>;
  }>(GLOBAL_PAGE_KEY, "navigation");
}

export async function getGlobalSocialPublic() {
  return getSectionDataPublic<{
    items: Array<{
      id: string;
      label: string;
      url: string;
      visible: boolean;
      sortOrder: number;
    }>;
  }>(GLOBAL_PAGE_KEY, "social");
}

export async function getGlobalFooterPublic() {
  return getSectionDataPublic<{
    tagline: string;
    copyrightLine: string;
    imprintLabel: string;
    privacyLabel: string;
  }>(GLOBAL_PAGE_KEY, "footer");
}

/** Plan aliases for public chrome consumers. */
export const getPublicNavigation = getGlobalNavigationPublic;
export const getPublicSocial = getGlobalSocialPublic;
export const getPublicFooter = getGlobalFooterPublic;

export {
  filterPublicNavigation,
  filterPublicSocial,
  type PublicNavItem,
  type PublicSocialItem,
} from "@/lib/site-content/public-chrome";

// ---------------------------------------------------------------------------
// Admin reads — includes hidden sections
// ---------------------------------------------------------------------------

/** Keep only sections registered in SITE_PAGE_DEFS (drops legacy orphans e.g. home/footer). */
function filterRegisteredSections(
  pageKey: string,
  sections: SiteSectionView[],
): SiteSectionView[] {
  const def = SITE_PAGE_DEFS.find((p) => p.key === pageKey);
  if (!def) return [];
  const order = new Map(def.sections.map((s, i) => [s.key, i]));
  return sections
    .filter((s) => order.has(s.key))
    .sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
}

/** Admin: registered sections including hidden; never use for public rendering. */
export async function getAdminSitePage(
  pageKey: string,
): Promise<AdminSitePageView | null> {
  if (!SITE_PAGE_DEFS.some((p) => p.key === pageKey)) return null;
  const page = await loadSitePageUncached(pageKey);
  if (!page) return null;
  const filtered = {
    ...page,
    sections: filterRegisteredSections(pageKey, page.sections),
  };
  filtered.lastUpdated = computePageLastUpdated({
    pageUpdatedAt: filtered.updatedAt,
    sectionUpdatedAts: filtered.sections.map((s) => s.updatedAt),
  });
  return toAdminPageView(filtered);
}

export async function listSitePagesAdmin(): Promise<AdminSitePageView[]> {
  await ensureSiteContentSeeded();
  const views: AdminSitePageView[] = [];
  for (const def of SITE_PAGE_DEFS) {
    const page = await getAdminSitePage(def.key);
    if (page) views.push(page);
  }
  return views;
}

export type SaveSitePageInput = {
  pageKey: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageId?: string | null;
  sections: Array<{
    key: string;
    data: unknown;
    isVisible?: boolean;
  }>;
};

/** Atomic page save (meta + all registered sections) in one transaction. */
export async function saveSitePage(
  input: SaveSitePageInput,
): Promise<AdminSitePageView> {
  const def = SITE_PAGE_DEFS.find((p) => p.key === input.pageKey);
  if (!def) throw new Error("Seite nicht gefunden");
  if (isGlobalPageKey(input.pageKey) && input.sections.length !== 1) {
    // Global editors save one section at a time via this endpoint too.
  }

  const current = await getAdminSitePage(input.pageKey);
  if (!current) throw new Error("Seite nicht gefunden");

  const allowedKeys = new Set(def.sections.map((s) => s.key));
  for (const section of input.sections) {
    if (!allowedKeys.has(section.key)) {
      throw new Error(`Unbekannte Sektion ${input.pageKey}/${section.key}`);
    }
  }

  // Validate all sections before writing.
  const prepared: Array<{
    key: string;
    data: Record<string, unknown>;
    isVisible: boolean;
  }> = [];
  for (const section of input.sections) {
    const sectionDef = getSectionDef(input.pageKey, section.key);
    const parsed = parseSectionData(input.pageKey, section.key, section.data);
    if (!parsed.ok) {
      throw new Error(`${sectionDef?.label ?? section.key}: ${parsed.error}`);
    }
    const previous = current.sections.find((s) => s.key === section.key)?.data;
    if (previous !== undefined) {
      for (const listPath of guessListPaths(previous, parsed.data)) {
        const idCheck = assertStableListIdsPreserved(
          previous,
          parsed.data,
          listPath,
        );
        if (!idCheck.ok) throw new Error(idCheck.error);
      }
    }
    if (
      section.isVisible === false &&
      isFixedSectionDef(sectionDef)
    ) {
      throw new Error(
        `${sectionDef?.label ?? section.key} kann nicht ausgeblendet werden`,
      );
    }
    prepared.push({
      key: section.key,
      data: parsed.data,
      isVisible: resolveSectionVisibility(
        sectionDef?.visibilityMode ?? "toggleable",
        section.isVisible,
      ),
    });
  }

  if (!isGlobalPageKey(input.pageKey)) {
    // SEO only for public pages
  } else if (
    input.metaTitle !== undefined ||
    input.metaDescription !== undefined ||
    input.ogImageId !== undefined
  ) {
    throw new Error("SEO-Felder sind für globale Inhalte nicht verfügbar");
  }

  await prisma.$transaction(async (tx) => {
    const page = await tx.sitePage.findUnique({
      where: { key: input.pageKey },
    });
    if (!page) throw new Error("Seite nicht gefunden");

    const pageData: Prisma.SitePageUpdateInput = {
      updatedAt: new Date(),
    };
    if (input.description !== undefined) {
      pageData.description = input.description?.trim() || null;
    }
    if (!isGlobalPageKey(input.pageKey)) {
      if (input.metaTitle !== undefined) {
        pageData.metaTitle = input.metaTitle?.trim() || null;
      }
      if (input.metaDescription !== undefined) {
        pageData.metaDescription = input.metaDescription?.trim() || null;
      }
      if (input.ogImageId !== undefined) {
        pageData.ogImage = input.ogImageId
          ? { connect: { id: input.ogImageId } }
          : { disconnect: true };
      }
    }

    await tx.sitePage.update({
      where: { id: page.id },
      data: pageData,
    });

    for (const section of prepared) {
      await tx.siteSection.update({
        where: {
          pageId_key: { pageId: page.id, key: section.key },
        },
        data: {
          data: section.data as Prisma.InputJsonValue,
          isVisible: section.isVisible,
        },
      });
    }
  });

  revalidateSiteContent(input.pageKey);
  const updated = await getAdminSitePage(input.pageKey);
  if (!updated) throw new Error("Seite nicht gefunden");
  return updated;
}

export async function updateSiteSection(input: {
  pageKey: string;
  sectionKey: string;
  data: unknown;
  isVisible?: boolean;
  /** Previous data for stable-id checks (optional). */
  previousData?: unknown;
}) {
  const def = getSectionDef(input.pageKey, input.sectionKey);
  if (!def && !getSectionSchemaExists(input.pageKey, input.sectionKey)) {
    throw new Error(`Unbekannte Sektion ${input.pageKey}/${input.sectionKey}`);
  }

  const parsed = parseSectionData(
    input.pageKey,
    input.sectionKey,
    input.data,
  );
  if (!parsed.ok) throw new Error(parsed.error);

  if (input.previousData !== undefined) {
    for (const listPath of guessListPaths(input.previousData, parsed.data)) {
      const idCheck = assertStableListIdsPreserved(
        input.previousData,
        parsed.data,
        listPath,
      );
      if (!idCheck.ok) throw new Error(idCheck.error);
    }
  }

  const page = await prisma.sitePage.findUnique({
    where: { key: input.pageKey },
  });
  if (!page) throw new Error("Seite nicht gefunden");

  const visibilityMode = def?.visibilityMode ?? "toggleable";
  if (
    input.isVisible !== undefined &&
    isFixedSectionDef(def) &&
    input.isVisible === false
  ) {
    throw new Error("Diese Sektion kann nicht ausgeblendet werden");
  }
  const isVisible = resolveSectionVisibility(visibilityMode, input.isVisible);

  const section = await prisma.siteSection.update({
    where: {
      pageId_key: { pageId: page.id, key: input.sectionKey },
    },
    data: {
      data: parsed.data as Prisma.InputJsonValue,
      isVisible,
    },
  });

  // Touch page updatedAt for overview ordering.
  await prisma.sitePage.update({
    where: { id: page.id },
    data: { updatedAt: new Date() },
  });

  revalidateSiteContent(input.pageKey);
  return section;
}

function getSectionSchemaExists(pageKey: string, sectionKey: string) {
  return Boolean(SITE_SECTION_SCHEMAS[pageKey]?.[sectionKey]);
}

function guessListPaths(
  previous: unknown,
  next: unknown,
): string[] {
  const paths = new Set<string>();
  collectArrayIdPaths(previous, "", paths);
  collectArrayIdPaths(next, "", paths);
  return [...paths];
}

function collectArrayIdPaths(
  value: unknown,
  prefix: string,
  out: Set<string>,
) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      value.every(
        (item) =>
          item &&
          typeof item === "object" &&
          typeof (item as { id?: unknown }).id === "string",
      )
    ) {
      if (prefix) out.add(prefix.replace(/^\./, ""));
    }
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(child)) {
      collectArrayIdPaths(child, path, out);
    } else if (child && typeof child === "object") {
      collectArrayIdPaths(child, path, out);
    }
  }
}

export async function ensureSiteContentSeeded() {
  await seedSiteContentDb(prisma);
}
