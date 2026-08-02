import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/db";
import { parseSectionData } from "@/lib/site-content/schemas";
import { seedSiteContent as seedSiteContentDb } from "@/lib/site-content/seed";

export {
  SITE_PAGE_DEFS,
  SITE_SECTION_SCHEMAS,
  getSectionSchema,
  parseSectionData,
} from "@/lib/site-content/schemas";
export { seedSiteContent } from "@/lib/site-content/seed";

export function sitePageCacheTag(pageKey: string) {
  return `site-page:${pageKey}`;
}

export const CONCERTS_PUBLIC_CACHE_TAG = "concerts-public";
export const PUBLIC_MEDIA_CACHE_TAG = "public-media";

export type SiteSectionView = {
  id: string;
  key: string;
  isVisible: boolean;
  data: Record<string, unknown>;
  valid: boolean;
  error?: string;
};

export type SitePageView = {
  id: string;
  key: string;
  title: string;
  sections: SiteSectionView[];
};

async function loadSitePageUncached(
  pageKey: string,
): Promise<SitePageView | null> {
  const page = await prisma.sitePage.findUnique({
    where: { key: pageKey },
    include: { sections: true },
  });
  if (!page) return null;

  const sections: SiteSectionView[] = page.sections.map((section) => {
    const parsed = parseSectionData(page.key, section.key, section.data);
    if (!parsed.ok) {
      console.error(
        `[site-content] invalid section ${page.key}/${section.key}: ${parsed.error}`,
      );
      return {
        id: section.id,
        key: section.key,
        isVisible: section.isVisible,
        data: {},
        valid: false,
        error: parsed.error,
      };
    }
    return {
      id: section.id,
      key: section.key,
      isVisible: section.isVisible,
      data: parsed.data,
      valid: true,
    };
  });

  return {
    id: page.id,
    key: page.key,
    title: page.title,
    sections,
  };
}

export function getSitePageCached(pageKey: string) {
  return unstable_cache(
    () => loadSitePageUncached(pageKey),
    [`site-page-${pageKey}`],
    { tags: [sitePageCacheTag(pageKey)] },
  )();
}

/** Public: only visible + valid sections. */
export async function getPublicSiteSections(pageKey: string) {
  const page = await getSitePageCached(pageKey);
  if (!page) return [];
  return page.sections.filter((s) => s.isVisible && s.valid);
}

export async function getSectionDataPublic<T extends Record<string, unknown>>(
  pageKey: string,
  sectionKey: string,
): Promise<T | null> {
  const sections = await getPublicSiteSections(pageKey);
  const section = sections.find((s) => s.key === sectionKey);
  return (section?.data as T) ?? null;
}

export async function listSitePagesAdmin() {
  const pages = await prisma.sitePage.findMany({
    include: {
      sections: { orderBy: { key: "asc" } },
    },
    orderBy: { key: "asc" },
  });
  return pages.map((page) => ({
    id: page.id,
    key: page.key,
    title: page.title,
    sections: page.sections.map((section) => {
      const parsed = parseSectionData(page.key, section.key, section.data);
      return {
        id: section.id,
        key: section.key,
        is_visible: section.isVisible,
        data: section.data,
        valid: parsed.ok,
        error: parsed.ok ? null : parsed.error,
        updated_at: section.updatedAt.toISOString(),
      };
    }),
  }));
}

export async function updateSiteSection(input: {
  pageKey: string;
  sectionKey: string;
  data: unknown;
  isVisible?: boolean;
}) {
  const parsed = parseSectionData(
    input.pageKey,
    input.sectionKey,
    input.data,
  );
  if (!parsed.ok) throw new Error(parsed.error);

  const page = await prisma.sitePage.findUnique({
    where: { key: input.pageKey },
  });
  if (!page) throw new Error("Seite nicht gefunden");

  const section = await prisma.$transaction(async (tx) => {
    return tx.siteSection.update({
      where: {
        pageId_key: { pageId: page.id, key: input.sectionKey },
      },
      data: {
        data: parsed.data as Prisma.InputJsonValue,
        ...(input.isVisible !== undefined
          ? { isVisible: input.isVisible }
          : {}),
      },
    });
  });

  revalidateTag(sitePageCacheTag(input.pageKey), "max");
  return section;
}

export async function ensureSiteContentSeeded() {
  await seedSiteContentDb(prisma);
}
