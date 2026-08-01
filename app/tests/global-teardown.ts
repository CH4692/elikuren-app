import { execSync } from "node:child_process";
import path from "node:path";

/** Reset shared E2E users after Playwright (skipped when DB setup was skipped). */
export default function globalTeardown() {
  if (process.env.SKIP_E2E_DB_SETUP === "1") {
    return;
  }

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
