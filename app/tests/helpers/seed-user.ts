import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient, type Role } from "../../lib/generated/prisma/client";
import { pgSslForConnectionString } from "../../lib/pg-connection";

loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.local", override: true });

/** Upsert an active user with password (for isolation in Playwright tests). */
export async function upsertCredentialUser(input: {
  email: string;
  password: string;
  role?: Role;
  firstname?: string;
  lastname?: string;
  voice?: string;
}) {
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
    const passwordHash = await bcrypt.hash(input.password, 12);
    const firstname = input.firstname ?? "E2E";
    const lastname = input.lastname ?? "Temp";
    return prisma.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        emailVerified: new Date(),
        firstname,
        lastname,
        name: `${firstname} ${lastname}`,
        role: input.role ?? "mitglied",
        voice: input.voice ?? "Alt",
        passwordHash,
        isActive: true,
        memberSince: new Date(),
      },
      update: {
        role: input.role ?? "mitglied",
        voice: input.voice ?? "Alt",
        passwordHash,
        isActive: true,
        emailVerified: new Date(),
        sessionVersion: 0,
      },
    });
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
