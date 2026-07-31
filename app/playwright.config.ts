import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Local secrets win over committed test placeholders.
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });

const port = process.env.PLAYWRIGHT_PORT ?? "3005";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**"],
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
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
