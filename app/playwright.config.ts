import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

const isCI = !!process.env.CI;
const isFullCI =
  process.env.CI_FULL === "1" || process.env.CI_FULL === "true";
const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

/** Keep Auth.js cookie host aligned with Playwright baseURL (localhost ≠ 127.0.0.1). */
const webServerEnv = {
  ...process.env,
  AUTH_ENABLE_PASSWORD_LOGIN: "1",
  AUTH_URL: baseURL,
  NEXT_PUBLIC_SITE_URL: baseURL,
};

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  // CI without CI_FULL: public smoke subset. CI_FULL=1 (dev/main CI): full e2e suite.
  ...(isCI && !isFullCI
    ? {
        testMatch: [
          "**/smoke/routes.test.ts",
          "**/smoke/health.test.ts",
          "**/smoke/security-headers.test.ts",
          "**/smoke/security-authz.test.ts",
          "**/smoke/performance.test.ts",
          "**/smoke/a11y.test.ts",
          "**/smoke/status-errors.test.ts",
          "**/smoke/route-integrity.test.ts",
          "**/pages/home.test.ts",
          "**/pages/content.test.ts",
        ],
      }
    : {}),
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Local Next.js cold-compile is flaky with many parallel logins.
  workers: isCI ? 1 : 2,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: isCI
    ? {
        command: `npm run start -- -p ${port}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: webServerEnv,
      }
    : {
        command: `npm run dev -- -p ${port}`,
        url: baseURL,
        // Prefer a fresh Playwright-owned server so AUTH_URL matches baseURL.
        reuseExistingServer: !process.env.PLAYWRIGHT_REUSE_SERVER,
        timeout: 180_000,
        env: webServerEnv,
      },
});
