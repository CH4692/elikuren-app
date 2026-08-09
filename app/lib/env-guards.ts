import { databaseHost } from "@/lib/db-url";

export function requireConfirm(flag: string, argvFlag: string, argv: string[]) {
  const ok =
    argv.includes(argvFlag) ||
    process.env[flag] === "1" ||
    process.env[flag] === "yes";
  if (!ok) {
    throw new Error(`Refusing: pass ${argvFlag} or set ${flag}=1`);
  }
}

export function connectionStringFromEnv(
  env: Record<string, string | undefined> = process.env,
) {
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL || "";
  if (!url) throw new Error("DATABASE_URL is required");
  if (url.includes("@127.0.0.1:5432/build")) {
    throw new Error("Refusing: placeholder build DATABASE_URL");
  }
  return url;
}

/** Preview wipe: never Production Vercel, never Production host allowlist. */
export function assertPreviewWipeAllowed(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.VERCEL_ENV === "production") {
    throw new Error("Refusing Preview wipe: VERCEL_ENV=production");
  }
  if ((env.TARGET_ENV || "").toLowerCase() !== "preview") {
    throw new Error('Refusing Preview wipe: set TARGET_ENV=preview');
  }

  const url = connectionStringFromEnv(env);
  const host = databaseHost(url);
  const productionHost = env.PRODUCTION_DATABASE_HOST?.trim().toLowerCase();
  if (productionHost && host.includes(productionHost)) {
    throw new Error(
      `Refusing Preview wipe: DATABASE_URL host matches PRODUCTION_DATABASE_HOST (${productionHost})`,
    );
  }

  const previewHost = env.PREVIEW_DATABASE_HOST?.trim().toLowerCase();
  if (previewHost && !host.includes(previewHost)) {
    throw new Error(
      `Refusing Preview wipe: DATABASE_URL host "${host}" does not match PREVIEW_DATABASE_HOST=${previewHost}`,
    );
  }

  // In GitHub Actions, CI_DATABASE_URL is defined as Preview Neon by policy.
  if (!previewHost && env.CI !== "true" && env.ALLOW_UNSCOPED_PREVIEW_WIPE !== "1") {
    throw new Error(
      "Refusing Preview wipe: set PREVIEW_DATABASE_HOST=<neon-preview-hostname> (or ALLOW_UNSCOPED_PREVIEW_WIPE=1 in CI only as last resort)",
    );
  }

  return { url, host };
}

/** Production seed: must target production host, never Preview. */
export function assertProductionSeedAllowed(
  env: Record<string, string | undefined> = process.env,
) {
  if ((env.TARGET_ENV || "").toLowerCase() !== "production") {
    throw new Error('Refusing Production seed: set TARGET_ENV=production');
  }

  const url = connectionStringFromEnv(env);
  const host = databaseHost(url);

  const previewHost = env.PREVIEW_DATABASE_HOST?.trim().toLowerCase();
  if (previewHost && host.includes(previewHost)) {
    throw new Error(
      `Refusing Production seed: DATABASE_URL host matches PREVIEW_DATABASE_HOST (${previewHost})`,
    );
  }

  const productionHost = env.PRODUCTION_DATABASE_HOST?.trim().toLowerCase();
  if (productionHost && !host.includes(productionHost)) {
    throw new Error(
      `Refusing Production seed: DATABASE_URL host "${host}" does not match PRODUCTION_DATABASE_HOST=${productionHost}`,
    );
  }

  if (!productionHost && env.ALLOW_UNSCOPED_PRODUCTION_SEED !== "1") {
    throw new Error(
      "Refusing Production seed: set PRODUCTION_DATABASE_HOST=<neon-production-hostname>",
    );
  }

  return { url, host };
}
