import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Runs via tsx so Prisma's generated client loads correctly.
 */
export default function globalSetup() {
  execSync("npx tsx ./tests/ensure-e2e-admin.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });
}
