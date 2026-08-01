import { execSync } from "node:child_process";
import path from "node:path";

/** Reset shared E2E users after Playwright (local / real DB only). */
export default function globalTeardown() {
  if (process.env.CI) {
    return;
  }

  const url = process.env.DATABASE_URL ?? "";
  if (!url || url.includes("@127.0.0.1:5432/build")) {
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
