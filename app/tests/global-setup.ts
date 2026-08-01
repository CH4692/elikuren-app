import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Seeds shared E2E users. Skipped in minimal CI smoke (SKIP_E2E_DB_SETUP=1).
 */
export default function globalSetup() {
  if (process.env.SKIP_E2E_DB_SETUP === "1") {
    console.log("E2E DB setup skipped (SKIP_E2E_DB_SETUP=1)");
    return;
  }

  execSync("npx tsx ./tests/ensure-e2e-admin.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });
}
