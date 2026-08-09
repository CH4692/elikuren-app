import "dotenv/config";
import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import { parseBerlinDateTimeLocal } from "../lib/datetime-berlin";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { seedSiteContent } from "../lib/site-content/seed";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const email =
  process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
  "admin@kammerchor-elikuren.de";
const password =
  process.env.SEED_ADMIN_PASSWORD ||
  `Elikuren-${Math.random().toString(36).slice(2, 10)}!`;

const HERBST_MARKETING = {
  subtitle: "Winterreise",
  description:
    'Der Kammerchor Elikuren und das musical team laden herzlich zu einem besonderen Konzert ein: Franz Schuberts "Winterreise" in einer eindrucksvollen Chorfassung - als Uraufführung von von Martin Kürschner, ehemaliger Rektor der Hochschule für Musik und Theater Leipzig und aktuell Professor für Komposition und Musiktheorie.',
  location: "Kath. Pfarrkirche St. Bonifatius",
  address: "Hindenburgstraße 17, 31515 Wunstorf",
  programInfo:
    'Franz Schuberts "Winterreise" zählt zu den bedeutenstenn Liedzyklen der Musikgeschichte. In dieser außergewähnlichen Fassung für Chor, komponiert von Martin Kürschner entfaltet das Werk eine neue klangliche Dimension.',
  leader: "Christiane Kampe",
  admissionInfo: "Frei. Spenden erwünscht.",
  footer: "Ein Konzertabend für alle, die Chormusik erleben möchten.",
} as const;

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

    await seedSiteContent(prisma);

    // Fill empty marketing fields for known Herbstkonzert; never overwrite editorial data.
    const candidates = await prisma.concert.findMany({
      where: {
        OR: [
          { title: { contains: "Herbst", mode: "insensitive" } },
          { title: { contains: "Winterreise", mode: "insensitive" } },
          { slug: { contains: "schubert", mode: "insensitive" } },
          { slug: { contains: "herbst", mode: "insensitive" } },
        ],
      },
    });

    const knownStartsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");

    for (const concert of candidates) {
      const startsAt = concert.startsAt ?? knownStartsAt;
      await prisma.concert.update({
        where: { id: concert.id },
        data: {
          ...(concert.startsAt ? {} : { startsAt }),
          subtitle: concert.subtitle ?? HERBST_MARKETING.subtitle,
          description: concert.description ?? HERBST_MARKETING.description,
          location: concert.location ?? HERBST_MARKETING.location,
          address: concert.address ?? HERBST_MARKETING.address,
          programInfo: concert.programInfo ?? HERBST_MARKETING.programInfo,
          leader: concert.leader ?? HERBST_MARKETING.leader,
          admissionInfo:
            concert.admissionInfo ?? HERBST_MARKETING.admissionInfo,
          footer: concert.footer ?? HERBST_MARKETING.footer,
          // Only auto-publish when startsAt is set (after this update).
          ...(startsAt && concert.websiteStatus === "DRAFT"
            ? { websiteStatus: "PUBLISHED" as const }
            : {}),
        },
      });
    }

    console.log("Admin seeded successfully");
    console.log(`id: ${user.id}`);
    console.log(`email: ${email}`);
    console.log(`password: ${password}`);
    console.log("Login: /auth/sign-in (E-Mail + Passwort)");
    console.log("Site content pages/sections ensured (idempotent)");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
