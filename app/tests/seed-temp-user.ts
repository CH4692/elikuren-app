import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient, type Role } from "../lib/generated/prisma/client";
import { pgSslForConnectionString } from "../lib/pg-connection";

/**
 * CLI (run via tsx, not imported by Playwright):
 *   E2E_TEMP_EMAIL=... E2E_TEMP_PASSWORD=... npx tsx ./tests/seed-temp-user.ts
 * Prints one JSON line: { "id": "...", "email": "..." }
 */
loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });

async function main() {
  const email = process.env.E2E_TEMP_EMAIL?.trim().toLowerCase();
  const password = process.env.E2E_TEMP_PASSWORD;
  if (!email || !password) {
    throw new Error("E2E_TEMP_EMAIL and E2E_TEMP_PASSWORD are required");
  }

  const role = (process.env.E2E_TEMP_ROLE as Role | undefined) ?? "mitglied";
  const firstname = process.env.E2E_TEMP_FIRSTNAME ?? "E2E";
  const lastname = process.env.E2E_TEMP_LASTNAME ?? "Temp";
  const voice = process.env.E2E_TEMP_VOICE ?? "Alt";

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({
    connectionString,
    ssl: pgSslForConnectionString(connectionString),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        emailVerified: new Date(),
        firstname,
        lastname,
        name: `${firstname} ${lastname}`,
        role,
        voice,
        passwordHash,
        isActive: true,
        memberSince: new Date(),
      },
      update: {
        role,
        voice,
        passwordHash,
        isActive: true,
        emailVerified: new Date(),
        sessionVersion: 0,
      },
    });
    process.stdout.write(JSON.stringify({ id: user.id, email: user.email }) + "\n");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
