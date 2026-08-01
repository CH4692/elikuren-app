#!/usr/bin/env node
/**
 * Merge .env.test with CI secrets from process.env (no shell escaping issues).
 * Expects DATABASE_URL, DATABASE_URL_UNPOOLED, AUTH_SECRET in the environment.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const testPath = path.join(root, ".env.test");
const localPath = path.join(root, ".env.local");

const overrideKeys = ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "AUTH_SECRET"];

function quoteEnvValue(value) {
  // Double-quote so Neon query params (&, =) survive dotenv parsing.
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const base = fs.readFileSync(testPath, "utf8").split("\n");
const lines = base.filter(
  (line) => !overrideKeys.some((key) => line.startsWith(`${key}=`)),
);

for (const key of overrideKeys) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
  // channel_binding=require can break some CI pg clients; Neon works with sslmode=require.
  const normalized = value.replace(/([?&])channel_binding=require&?/g, "$1").replace(/[?&]$/, "");
  lines.push(`${key}=${quoteEnvValue(normalized)}`);
}

fs.writeFileSync(localPath, `${lines.filter(Boolean).join("\n")}\n`);
console.log("Wrote .env.local for CI (secrets present, values redacted).");
