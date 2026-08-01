import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import pg from "pg";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

async function main() {
  const email = (process.argv[2] || "charles.heller@hotmail.de")
    .trim()
    .toLowerCase();
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const pool = new pg.Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      console.error(`USER_NOT_FOUND: ${email}`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "vorstand", isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        firstname: true,
        lastname: true,
      },
    });
    console.log(JSON.stringify(updated, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
