/**
 * Full Preview wipe: truncate all app tables + empty Preview R2 bucket.
 *
 *   TARGET_ENV=preview PREVIEW_WIPE_CONFIRM=1 \
 *   PREVIEW_DATABASE_HOST=ep-....neon.tech \
 *   npx tsx ./scripts/wipe-preview.ts --confirm
 *
 * Optional R2 (skipped if unset):
 *   R2_* + optional R2_PREVIEW_BUCKET_NAME must match R2_BUCKET_NAME
 *
 * Never points at Production. Does not touch `_prisma_migrations`.
 */
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import { databaseHost } from "../lib/db-url";
import {
  assertPreviewWipeAllowed,
  connectionStringFromEnv,
  requireConfirm,
} from "../lib/env-guards";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { r2Configured } from "../lib/r2";
import { wipeAllAppTables } from "../lib/wipe-database";
import { wipeR2Bucket } from "../lib/wipe-r2-bucket";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });
loadEnv({ path: ".env.wipe", override: true, quiet: true });

async function main() {
  requireConfirm("PREVIEW_WIPE_CONFIRM", "--confirm", process.argv);

  // Derive host pin from DATABASE_URL when unset (CI Preview Neon).
  if (!process.env.PREVIEW_DATABASE_HOST?.trim()) {
    const url = connectionStringFromEnv(process.env);
    process.env.PREVIEW_DATABASE_HOST = databaseHost(url);
  }

  const { url, host } = assertPreviewWipeAllowed(process.env);

  const skipR2 =
    process.argv.includes("--skip-r2") || process.env.PREVIEW_WIPE_SKIP_R2 === "1";

  console.log(`Preview wipe starting on DB host ${host}`);

  const pool = new Pool({
    connectionString: url,
    ssl: pgSslForConnectionString(url),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    // Ensure we can connect before truncate.
    await prisma.$queryRaw`SELECT 1`;
    const tables = await wipeAllAppTables(pool);
    console.log(`Truncated ${tables} app tables (migrations kept).`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  if (skipR2) {
    console.log("R2 wipe skipped (--skip-r2 / PREVIEW_WIPE_SKIP_R2=1).");
    return;
  }

  if (!r2Configured()) {
    console.warn(
      "R2 wipe skipped: Preview R2 credentials not configured in this environment.",
    );
    return;
  }

  const r2 = await wipeR2Bucket(process.env);
  console.log(`R2 wipe complete: bucket=${r2.bucket} deleted=${r2.deleted}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
