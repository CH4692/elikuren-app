import type { Metadata } from "next";

import { publicObjectUrl } from "@/lib/public-media";
import { getSitePageDef } from "@/lib/site-content/defaults";
import { getPublicSitePage } from "@/lib/site-content/index";
import { isPublicSitePageKey } from "@/lib/site-content/registry";

export const SITE_DEFAULT_TITLE = "Kammerchor Elikuren";
export const SITE_DEFAULT_DESCRIPTION =
  "Kammerchor Elikuren aus Wunstorf – anspruchsvolle Chormusik, Konzerte und Ensembles unter der Leitung von Christiane Kampe.";

/**
 * Public metadata for a CMS page.
 * Uses the same tagged public page cache as content (invalidated on save).
 */
export async function buildPublicPageMetadata(
  pageKey: string,
): Promise<Metadata> {
  if (!isPublicSitePageKey(pageKey)) {
    return {
      title: SITE_DEFAULT_TITLE,
      description: SITE_DEFAULT_DESCRIPTION,
    };
  }

  const def = getSitePageDef(pageKey);
  const page = await getPublicSitePage(pageKey);
  const appTitle = def?.title ?? page?.title ?? SITE_DEFAULT_TITLE;

  const title = page?.metaTitle?.trim() || `${appTitle} · ${SITE_DEFAULT_TITLE}`;
  const description =
    page?.metaDescription?.trim() || SITE_DEFAULT_DESCRIPTION;

  const ogUrl = page?.ogImageObjectKey
    ? publicObjectUrl(page.ogImageObjectKey)
    : null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
  };
}
