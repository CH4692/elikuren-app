/**
 * Wipe Playwright / E2E marker data from the connected database (Preview Neon).
 *
 *   E2E_WIPE_CONFIRM=1 npx tsx ./scripts/wipe-e2e-data.ts
 *   npx tsx ./scripts/wipe-e2e-data.ts --confirm
 *
 * Never point DATABASE_URL at Production. Shared e2e-* fixture users are kept
 * and re-upserted afterward when ensure-e2e-admin is available.
 */
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import {
  assertE2EWipeAllowed,
  cleanupE2ETestData,
} from "../lib/e2e-data-cleanup";
import { pgSslForConnectionString } from "../lib/pg-connection";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

async function main() {
  const confirmed =
    process.argv.includes("--confirm") ||
    process.env.E2E_WIPE_CONFIRM === "1" ||
    process.env.E2E_WIPE_CONFIRM === "yes";

  if (!confirmed) {
    console.error(
      "Refusing to wipe: pass --confirm or set E2E_WIPE_CONFIRM=1 (Preview/test Neon only).",
    );
    process.exit(2);
  }

  assertE2EWipeAllowed(process.env);

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!;
  const pool = new Pool({
    connectionString,
    ssl: pgSslForConnectionString(connectionString),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const host = (() => {
      try {
        return new URL(connectionString).host;
      } catch {
        return "(unknown)";
      }
    })();
    console.log(`Wiping E2E marker data on ${host} …`);
    const result = await cleanupE2ETestData(prisma, process.env);
    console.log("E2E wipe complete:", result);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  if (process.env.E2E_WIPE_SKIP_RESEED === "1") {
    return;
  }

  try {
    execSync("npx tsx ./tests/ensure-e2e-admin.ts", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
      env: process.env,
    });
  } catch {
    console.warn("E2E fixture reseed skipped (ensure-e2e-admin failed).");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
