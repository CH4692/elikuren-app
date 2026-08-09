import { execSync } from "node:child_process";
import path from "node:path";

/**
 * After Playwright: delete marker-based E2E rows, then re-upsert shared fixtures.
 * Runs locally and in CI whenever a real DATABASE_URL is configured.
 */
export default function globalTeardown() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url || url.includes("@127.0.0.1:5432/build")) {
    return;
  }

  const cwd = path.join(__dirname, "..");
  const env = {
    ...process.env,
    E2E_WIPE_CONFIRM: "1",
    // ensure-e2e-admin is invoked by the wipe script afterward.
    E2E_WIPE_SKIP_RESEED: "0",
  };

  try {
    execSync("npx tsx ./scripts/wipe-e2e-data.ts --confirm", {
      stdio: "inherit",
      cwd,
      env,
    });
  } catch {
    console.warn("E2E data cleanup skipped (database unavailable).");
    try {
      execSync("npx tsx ./tests/ensure-e2e-admin.ts", {
        stdio: "inherit",
        cwd,
        env: process.env,
      });
    } catch {
      console.warn("E2E user reset skipped (database unavailable).");
    }
  }
}
