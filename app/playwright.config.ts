import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Safe defaults first, then Neon + secrets from .env.local (or CI-generated .env.local).
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });

const isCI = !!process.env.CI;
const port = process.env.PLAYWRIGHT_PORT ?? "3005";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry is enough in CI; two made the 118-test suite exceed runner limits.
  retries: isCI ? 1 : 1,
  // Serial locally (shared Neon user state); two workers in CI for wall-clock time.
  workers: isCI ? 2 : 1,
  reporter: isCI ? "github" : "html",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // CI already runs `npm run build`; production server is faster/stabler than `next dev`.
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
});
