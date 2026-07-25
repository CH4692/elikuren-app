import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// CI/test defaults first; local secrets override when present.
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });

const baseURL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: baseURL,
      AUTH_URL: process.env.AUTH_URL ?? baseURL,
    },
  },
});
