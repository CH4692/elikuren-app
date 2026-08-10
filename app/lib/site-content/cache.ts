import { revalidatePath, revalidateTag } from "next/cache";

import {
  GLOBAL_CONSUMER_PATHS,
  GLOBAL_PAGE_KEY,
  isGlobalPageKey,
  isPublicSitePageKey,
  publicPathForPageKey,
  type PublicSitePageKey,
} from "@/lib/site-content/registry";

/** Data-cache tag for one SitePage (public or global). */
export function sitePageCacheTag(pageKey: string) {
  return `site-page:${pageKey}`;
}

/** Stable unstable_cache key part for a page payload. */
export function sitePageCacheKey(pageKey: string) {
  // Bump when public payload shape or seed media wiring changes require a cold cache.
  return `site-content:page:${pageKey}:v5`;
}

export const CONCERTS_PUBLIC_CACHE_TAG = "concerts-public";

/**
 * Immediate expire for CMS/admin Route Handler mutations.
 * Do NOT use profile "max" here — that is stale-while-revalidate and was the
 * Phase 3 root cause of stale public content after save.
 */
function expireTagNow(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

/**
 * Invalidate one site page cache tag and its public path (if any).
 * Prefer this over scattering revalidatePath in handlers.
 */
export function revalidateSiteContent(pageKey: string) {
  expireTagNow(sitePageCacheTag(pageKey));

  if (isGlobalPageKey(pageKey)) {
    revalidateGlobalSiteContent();
    return;
  }

  if (isPublicSitePageKey(pageKey)) {
    revalidatePath(publicPathForPageKey(pageKey as PublicSitePageKey));
  }
}

/**
 * Invalidate global config and every public route that consumes nav/footer/org.
 */
export function revalidateGlobalSiteContent() {
  expireTagNow(sitePageCacheTag(GLOBAL_PAGE_KEY));
  for (const path of GLOBAL_CONSUMER_PATHS) {
    revalidatePath(path);
  }
}
