#!/usr/bin/env node
/**
 * Merge .env.test with CI secrets from process.env (no shell escaping issues).
 * Usage: DATABASE_URL=... node scripts/write-ci-env.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const testPath = path.join(root, ".env.test");
const localPath = path.join(root, ".env.local");

const overrideKeys = ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "AUTH_SECRET"];

const base = fs.readFileSync(testPath, "utf8").split("\n");
const lines = base.filter(
  (line) => !overrideKeys.some((key) => line.startsWith(`${key}=`)),
);

for (const key of overrideKeys) {
  const value = process.env[key]?.trim();
  if (value) lines.push(`${key}=${value}`);
}

fs.writeFileSync(localPath, `${lines.filter(Boolean).join("\n")}\n`);
