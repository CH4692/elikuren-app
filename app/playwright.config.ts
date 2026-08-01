import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Safe defaults first, then local secrets / CI-generated .env.local.
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });

const isCI = !!process.env.CI;
const previewUrl = (
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.BASE_URL ||
  ""
).replace(/\/$/, "");
const againstRemote = previewUrl.length > 0;

const port = process.env.PLAYWRIGHT_PORT ?? "3005";
const baseURL = againstRemote ? previewUrl : `http://127.0.0.1:${port}`;

const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 1,
  // Shared E2E users on Neon — serial avoids login races.
  workers: 1,
  reporter: isCI ? "github" : "html",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    navigationTimeout: 45_000,
    ...(bypass
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": bypass,
            "x-vercel-set-bypass-cookie": "true",
          },
        }
      : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Only spin up a local server when not targeting a Preview / remote URL.
  ...(againstRemote
    ? {}
    : {
        webServer: {
          command: isCI
            ? `npx next start --port ${port}`
            : `npm run dev -- --port ${port}`,
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 180_000,
          env: {
            ...process.env,
            PORT: port,
            NEXT_PUBLIC_SITE_URL: baseURL,
            AUTH_URL: baseURL,
          },
        },
      }),
});
