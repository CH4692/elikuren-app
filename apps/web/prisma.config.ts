import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prefer .env.local (dev), then .env.test (CI), then .env
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env" });

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
