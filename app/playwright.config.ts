import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Safe defaults first, then local secrets.
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
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["html", { open: "never" }], ["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
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
  ...(againstRemote
    ? {}
    : {
        webServer: isCI
          ? {
              command: `npx next start --port ${port}`,
              url: baseURL,
              reuseExistingServer: false,
              timeout: 120_000,
              env: {
                ...process.env,
                PORT: port,
                NEXT_PUBLIC_SITE_URL: baseURL,
                AUTH_URL: baseURL,
              },
            }
          : {
              command: `npm run dev -- --port ${port}`,
              url: baseURL,
              reuseExistingServer: true,
              timeout: 120_000,
              env: {
                ...process.env,
                PORT: port,
                NEXT_PUBLIC_SITE_URL: baseURL,
                AUTH_URL: baseURL,
              },
            },
      }),
});
