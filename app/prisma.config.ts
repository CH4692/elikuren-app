import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prefer .env.local (dev), then .env.test (CI), then .env
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env", quiet: true });

const migrationsUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationsUrl,
  },
});
