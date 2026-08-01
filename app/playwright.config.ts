import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

const isCI = !!process.env.CI;
const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  // CI: public smoke only (no Neon). Locally: full suite.
  ...(isCI
    ? {
        testMatch: [
          "**/smoke/routes.test.ts",
          "**/smoke/health.test.ts",
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
  workers: isCI ? 1 : undefined,
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
      }
    : {
        command: `npm run dev -- -p ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
