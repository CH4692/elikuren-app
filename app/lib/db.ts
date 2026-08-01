import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { pgSslForConnectionString } from "@/lib/pg-connection";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: 10,
      ssl: pgSslForConnectionString(connectionString),
    });
  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getOrCreatePrismaClient() {
  const cached = globalForPrisma.prisma;
  // Dev/HMR can keep an old PrismaClient after `prisma generate` adds models.
  if (cached && "contact" in cached && cached.contact) {
    return cached;
  }
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getOrCreatePrismaClient();
