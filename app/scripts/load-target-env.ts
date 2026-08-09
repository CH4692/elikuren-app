/**
 * Env loader for seed/import scripts.
 *
 * Production:
 *   TARGET_ENV=production
 *   SEED_PRODUCTION_CONFIRM=1
 *   PRODUCTION_DATABASE_HOST=<host from production DATABASE_URL>
 *   loads `.env.production` with override (never Preview/.env.local)
 *
 * Local/default:
 *   loads `.env.local` then `.env` (no override of existing process env)
 */
import { config as loadEnv } from "dotenv";

const PREVIEW_HOST_MARKERS = [
  "ep-rapid-credit-ag46ehg9", // known local/preview Neon
];

const PREVIEW_BUCKET_NAMES = new Set(["elikuren-music"]);

function parseHost(connectionString: string): string {
  try {
    return new URL(connectionString).hostname;
  } catch {
    const m = connectionString.match(/@([^/?]+)/);
    if (!m?.[1]) {
      throw new Error("Could not parse database host from DATABASE_URL");
    }
    return m[1];
  }
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase();
}

function hostsMatch(expected: string, actual: string) {
  const a = normalizeHost(actual);
  const e = normalizeHost(expected);
  if (a === e) return true;
  // Allow pooler ↔ direct Neon host pairing for the same endpoint id.
  const strip = (h: string) => h.replace("-pooler.", ".");
  return strip(a) === strip(e);
}

export function assertProductionGuards() {
  if (process.env.TARGET_ENV?.trim().toLowerCase() !== "production") {
    throw new Error("TARGET_ENV=production is required for production scripts");
  }
  if (process.env.SEED_PRODUCTION_CONFIRM !== "1") {
    throw new Error("SEED_PRODUCTION_CONFIRM=1 is required for production scripts");
  }

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) throw new Error("DATABASE_URL missing after loading .env.production");

  const actualHost = parseHost(dbUrl);
  const expectedHost = process.env.PRODUCTION_DATABASE_HOST?.trim();
  if (!expectedHost) {
    throw new Error(
      "PRODUCTION_DATABASE_HOST is required and must match DATABASE_URL host",
    );
  }
  if (!hostsMatch(expectedHost, actualHost)) {
    throw new Error(
      `PRODUCTION_DATABASE_HOST mismatch: expected "${expectedHost}", got "${actualHost}"`,
    );
  }

  for (const marker of PREVIEW_HOST_MARKERS) {
    if (actualHost.includes(marker)) {
      throw new Error(
        `Refusing production run: DATABASE_URL host looks like Preview (${actualHost})`,
      );
    }
  }

  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("R2_BUCKET_NAME missing after loading .env.production");
  if (PREVIEW_BUCKET_NAMES.has(bucket)) {
    throw new Error(
      `Refusing production run: R2_BUCKET_NAME "${bucket}" looks like Preview`,
    );
  }

  const requiredR2 = [
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ] as const;
  for (const key of requiredR2) {
    if (!process.env[key]?.trim()) {
      throw new Error(`${key} missing after loading .env.production`);
    }
  }
  if (
    !process.env.R2_ACCOUNT_ID?.trim() &&
    !process.env.R2_ENDPOINT?.trim()
  ) {
    throw new Error("R2_ACCOUNT_ID or R2_ENDPOINT required");
  }

  console.log(
    JSON.stringify({
      target: "production",
      databaseHost: actualHost,
      r2Bucket: bucket,
    }),
  );
}

/** Load env for the intended target. Returns "production" | "local". */
export function loadTargetEnv(): "production" | "local" {
  const target = process.env.TARGET_ENV?.trim().toLowerCase();
  if (target === "production") {
    const result = loadEnv({
      path: ".env.production",
      override: true,
      quiet: true,
    });
    if (result.error) {
      throw new Error(
        `Failed to load .env.production: ${result.error.message}`,
      );
    }
    assertProductionGuards();
    return "production";
  }

  loadEnv({ path: ".env.local", quiet: true });
  loadEnv({ path: ".env", quiet: true });
  return "local";
}
