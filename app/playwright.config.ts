import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Local secrets win over committed test placeholders, except where noted below.
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });
// Playwright/E2E always use committed test DB credentials (CI + docker-compose.test.yml).
loadEnv({ path: ".env.test", override: true });

const testDbPort = process.env.TEST_DB_PORT;
if (testDbPort && testDbPort !== "5432") {
  for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED"] as const) {
    const value = process.env[key];
    if (value?.includes(":5432/")) {
      process.env[key] = value.replace(":5432/", `:${testDbPort}/`);
    }
  }
}

const port = process.env.PLAYWRIGHT_PORT ?? "3005";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  timeout: 60_000,
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
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: port,
      NEXT_PUBLIC_SITE_URL: baseURL,
      AUTH_URL: baseURL,
    },
  },
});
