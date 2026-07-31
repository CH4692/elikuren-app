import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient, type Role } from "../lib/generated/prisma/client";
import { pgSslForConnectionString } from "../lib/pg-connection";
import {
  getE2EAdminCredentials,
  getE2EAuditorCredentials,
  getE2EMemberCredentials,
} from "./helpers/credentials";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env.test", override: true });

const testDbPort = process.env.TEST_DB_PORT;
if (testDbPort && testDbPort !== "5432") {
  for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED"] as const) {
    const value = process.env[key];
    if (value?.includes(":5432/")) {
      process.env[key] = value.replace(":5432/", `:${testDbPort}/`);
    }
  }
}

async function upsertUser(
  prisma: PrismaClient,
  input: {
    email: string;
    password: string;
    role: Role;
    firstname: string;
    lastname: string;
    voice?: string;
  },
) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      emailVerified: new Date(),
      firstname: input.firstname,
      lastname: input.lastname,
      name: `${input.firstname} ${input.lastname}`,
      role: input.role,
      voice: input.voice ?? null,
      passwordHash,
      isActive: true,
      memberSince: new Date(),
    },
    update: {
      role: input.role,
      voice: input.voice ?? null,
      passwordHash,
      isActive: true,
      emailVerified: new Date(),
      sessionVersion: 0,
    },
  });
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Playwright admin setup");
  }

  const pool = new Pool({
    connectionString,
    ssl: pgSslForConnectionString(connectionString),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const admin = getE2EAdminCredentials();
    const member = getE2EMemberCredentials();
    const auditor = getE2EAuditorCredentials();

    await upsertUser(prisma, {
      email: admin.email,
      password: admin.password,
      role: "vorstand",
      firstname: "E2E",
      lastname: "Admin",
      voice: "Bass",
    });
    await upsertUser(prisma, {
      email: member.email,
      password: member.password,
      role: "mitglied",
      firstname: "E2E",
      lastname: "Mitglied",
      voice: "Sopran",
    });
    await upsertUser(prisma, {
      email: auditor.email,
      password: auditor.password,
      role: "kassenpruefer",
      firstname: "E2E",
      lastname: "Kassenpruefer",
      voice: "Alt",
    });

    console.log(`E2E admin ready: ${admin.email}`);
    console.log(`E2E member ready: ${member.email}`);
    console.log(`E2E auditor ready: ${auditor.email}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
