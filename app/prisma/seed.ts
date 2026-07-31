import "dotenv/config";
import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import { pgSslForConnectionString } from "../lib/pg-connection";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const email =
  process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
  "admin@kammerchor-elikuren.de";
const password =
  process.env.SEED_ADMIN_PASSWORD ||
  `Elikuren-${Math.random().toString(36).slice(2, 10)}!`;

async function main() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for seeding");
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
        firstname: "Admin",
        lastname: "Vorstand",
        name: "Admin Vorstand",
        role: "vorstand",
        passwordHash,
        isActive: true,
        memberSince: new Date(),
      },
      update: {
        role: "vorstand",
        passwordHash,
        emailVerified: new Date(),
        firstname: "Admin",
        lastname: "Vorstand",
        isActive: true,
      },
    });

    console.log("Admin seeded successfully");
    console.log(`id: ${user.id}`);
    console.log(`email: ${email}`);
    console.log(`password: ${password}`);
    console.log("Login: /auth/sign-in (E-Mail + Passwort)");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
