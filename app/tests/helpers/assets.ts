import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Public assets that must always be present for marketing pages. */
export const CRITICAL_ASSETS = [
  "/Logo.svg",
  "/kammerchor.jpg",
  "/chorleitung.jpg",
  "/goethe-institut.svg",
  "/sparkasse-wunstorf.png",
  "/musik-schule-logo.png",
  "/elikuren-ensemble.jpg",
  "/elikuren_hero.jpg",
  "/elikuren_gallery_1.jpg",
  "/elikuren_gallery_2.jpg",
  "/elikuren_gallery_3.jpg",
  "/eight-to-the-bar.jpg",
  "/eight-hero.jpg",
  "/eight_gallery_1.jpg",
  "/eight_gallery_2.jpg",
  "/eight_gallery_3.jpg",
  "/musical-team.jpg",
  "/musical_hero.jpeg",
  "/musical_gallery_1.jpg",
  "/musical_gallery_2.jpg",
  "/musical_gallery_3.jpg",
  "/icon1.png",
  "/apple-icon.png",
  "/favicon.ico",
] as const;

export const PUBLIC_ROUTES = [
  "/home",
  "/about",
  "/chorleitung",
  "/history",
  "/proben",
  "/contact",
  "/impressum",
  "/datenschutz",
  "/ensembles/elikuren",
  "/ensembles/eight-to-the-bar",
  "/ensembles/musical-team",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/verify",
  "/manifest.json",
] as const;

export async function expectAssetOk(
  request: APIRequestContext,
  path: string,
) {
  const res = await request.get(path);
  expect(res.status(), `asset ${path}`).toBeLessThan(400);
  expect(res.status(), `asset ${path} not missing`).not.toBe(404);
}

export async function expectAssetsOk(
  request: APIRequestContext,
  paths: readonly string[],
) {
  for (const path of paths) {
    await expectAssetOk(request, path);
  }
}

/**
 * Collects image URLs from the rendered page (Next/Image often uses /_next/image).
 * Asserts every resolved image response is OK.
 */
export async function expectPageImagesLoad(page: Page) {
  const urls = await page.evaluate(() => {
    const out = new Set<string>();
    for (const img of Array.from(document.images)) {
      if (img.currentSrc) out.add(img.currentSrc);
      else if (img.src) out.add(img.src);
    }
    return [...out];
  });

  expect(urls.length, "page should render at least one image").toBeGreaterThan(0);

  for (const url of urls) {
    const ok = await page.evaluate(async (imageUrl) => {
      const res = await fetch(imageUrl, { method: "GET" });
      return res.ok;
    }, url);
    expect(ok, `image failed: ${url}`).toBeTruthy();
  }
}
