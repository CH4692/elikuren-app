import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prefer direct (non-pooler) URL for migrations against Neon.
const migrationsUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL_MIGRATIONS ||
  process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationsUrl,
  },
});
