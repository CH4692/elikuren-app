/**
 * Seed Production Neon (admin + CMS skeleton + Herbst marketing fill).
 * Does NOT wipe Production. Does NOT copy Preview rows. Does NOT upload R2 media.
 *
 *   TARGET_ENV=production SEED_PRODUCTION_CONFIRM=1 \
 *   PRODUCTION_DATABASE_HOST=ep-....neon.tech \
 *   DATABASE_URL=... DATABASE_URL_UNPOOLED=... \
 *   npx tsx ./scripts/seed-production.ts --confirm
 *
 * For concerts/media/members afterward, run import scripts with Production R2:
 *   npm run import:media:apply
 *   npm run import:folder-batches:apply
 *   npm run import:members
 */
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import path from "node:path";

import {
  assertProductionSeedAllowed,
  requireConfirm,
} from "../lib/env-guards";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });
loadEnv({ path: ".env.production.seed", override: true, quiet: true });

async function main() {
  requireConfirm("SEED_PRODUCTION_CONFIRM", "--confirm", process.argv);
  const { host } = assertProductionSeedAllowed(process.env);

  console.log(`Production seed starting on DB host ${host}`);
  console.log(
    "Scope: admin user + site CMS pages/sections + Herbst marketing fill on matching concerts.",
  );

  execSync("npx tsx ./prisma/seed.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });

  console.log("Production seed complete.");
  console.log(
    "Note: concerts/media/files require Production R2 + import scripts (not done here).",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
