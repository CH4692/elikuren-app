import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Seeds shared E2E users when a real database is available.
 * Skipped when only the .env.test placeholder URL is present.
 */
export default function globalSetup() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url || url.includes("@127.0.0.1:5432/build")) {
    console.log("E2E DB setup skipped (no real DATABASE_URL)");
    return;
  }

  execSync("npx tsx ./tests/ensure-e2e-admin.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });
}
