import type { Pool } from "pg";

/** All application tables from schema.prisma (public schema). */
export const APP_TABLES = [
  "user_content_events",
  "user_favorites",
  "concert_items",
  "sheet_files",
  "audio_files",
  "media_assets",
  "invoices",
  "stored_files",
  "concerts",
  "site_sections",
  "site_pages",
  "membership_requests",
  "sessions",
  "accounts",
  "verification_tokens",
  "users",
] as const;

/**
 * Truncate every app table. Uses CASCADE so FK order does not matter.
 * Does not touch Prisma migration history (`_prisma_migrations`).
 */
export async function wipeAllAppTables(pool: Pool): Promise<number> {
  const list = APP_TABLES.map((name) => `"${name}"`).join(", ");
  await pool.query(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
  return APP_TABLES.length;
}
