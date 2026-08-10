import { expect, test } from "@playwright/test";

const isCI = !!process.env.CI;
const ttfbBudgetMs = Number(
  process.env.PERF_TTFB_MS ?? (isCI ? 2500 : 1500),
);
const loadBudgetMs = Number(
  process.env.PERF_LOAD_MS ?? (isCI ? 5000 : 3000),
);

const HOT_PATHS = [
  "/",
  "/home",
  "/contact",
  "/ensembles/elikuren",
] as const;

for (const path of HOT_PATHS) {
  test(`performance budget for ${path}`, async ({ page }) => {
    const started = Date.now();
    const response = await page.goto(path, { waitUntil: "load" });
    const loadMs = Date.now() - started;

    expect(response, path).not.toBeNull();
    expect(response!.status(), path).toBeLessThan(400);

    const timing = response!.request().timing();
    const ttfbMs = timing.responseStart;

    expect(
      ttfbMs,
      `${path} TTFB ${ttfbMs}ms exceeded budget ${ttfbBudgetMs}ms`,
    ).toBeLessThanOrEqual(ttfbBudgetMs);
    expect(
      loadMs,
      `${path} load ${loadMs}ms exceeded budget ${loadBudgetMs}ms`,
    ).toBeLessThanOrEqual(loadBudgetMs);
  });
}
