import { expect, test } from "@playwright/test";

const isCI = !!process.env.CI;
const ttfbBudgetMs = Number(
  process.env.PERF_TTFB_MS ?? (isCI ? 2500 : 1500),
);
const loadBudgetMs = Number(
  process.env.PERF_LOAD_MS ?? (isCI ? 5000 : 3000),
);
/** Soft CWV gates — shared runners are noisy; fail only on extreme outliers. */
const lcpBudgetMs = Number(
  process.env.PERF_LCP_MS ?? (isCI ? 8000 : 4000),
);
const clsBudget = Number(process.env.PERF_CLS_MAX ?? (isCI ? 0.35 : 0.25));
const enforceSoftCwv = process.env.PERF_ENFORCE_CWV === "1";

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

    const cwv = await page.evaluate(async () => {
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;
      let lcp = 0;
      let cls = 0;
      try {
        const lcpEntries = performance.getEntriesByType(
          "largest-contentful-paint",
        ) as PerformanceEntry[];
        if (lcpEntries.length) {
          lcp = lcpEntries[lcpEntries.length - 1]?.startTime ?? 0;
        }
      } catch {
        /* unsupported */
      }
      try {
        const clsEntries = performance.getEntriesByType(
          "layout-shift",
        ) as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>;
        cls = clsEntries
          .filter((e) => !e.hadRecentInput)
          .reduce((sum, e) => sum + (e.value ?? 0), 0);
      } catch {
        /* unsupported */
      }
      return {
        lcp: lcp || nav?.domContentLoadedEventEnd || 0,
        cls,
      };
    });

    // Always report; enforce only when PERF_ENFORCE_CWV=1 or extreme.
    console.log(
      `[perf] ${path} ttfb=${Math.round(ttfbMs)}ms load=${loadMs}ms lcp≈${Math.round(cwv.lcp)}ms cls≈${cwv.cls.toFixed(3)}`,
    );

    if (enforceSoftCwv) {
      if (cwv.lcp > 0) {
        expect(cwv.lcp).toBeLessThanOrEqual(lcpBudgetMs);
      }
      expect(cwv.cls).toBeLessThanOrEqual(clsBudget);
    } else if (cwv.lcp > lcpBudgetMs * 2) {
      expect
        .soft(cwv.lcp, `${path} extreme LCP ${cwv.lcp}`)
        .toBeLessThanOrEqual(lcpBudgetMs * 2);
    }
  });
}

test("health API latency smoke", async ({ request }) => {
  const started = Date.now();
  const res = await request.get("/api/health");
  const ms = Date.now() - started;
  expect(res.ok()).toBeTruthy();
  const budget = Number(process.env.PERF_API_HEALTH_MS ?? (isCI ? 2000 : 1000));
  expect(ms, `GET /api/health ${ms}ms`).toBeLessThanOrEqual(budget);
});
