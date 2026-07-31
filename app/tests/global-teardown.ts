import { execSync } from "node:child_process";
import path from "node:path";

/** Reset shared E2E users after Playwright (reactivate member, refresh passwords). */
export default function globalTeardown() {
  try {
    execSync("npx tsx ./tests/ensure-e2e-admin.ts", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
      env: process.env,
    });
  } catch {
    console.warn("E2E user reset skipped (database unavailable).");
  }
}
