/**
 * Merge Winterreise into one Concert + two ConcertPerformances.
 *
 * Dry-run (default):
 *   npx tsx ./scripts/merge-winterreise-performances.ts
 *
 * Apply locally/preview:
 *   npx tsx ./scripts/merge-winterreise-performances.ts --apply
 *
 * Apply production (guarded):
 *   TARGET_ENV=production SEED_PRODUCTION_CONFIRM=1 \
 *   PRODUCTION_DATABASE_HOST=ep-....neon.tech \
 *   npx tsx ./scripts/merge-winterreise-performances.ts --apply
 */
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import {
  mirrorFieldsFromPerformance,
  pickMirrorPerformance,
} from "../lib/concert-performances";
import { parseBerlinDateTimeLocal } from "../lib/datetime-berlin";
import { PrismaClient } from "../lib/generated/prisma/client";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { loadTargetEnv } from "./load-target-env";

loadTargetEnv();

const KEEP_MATCH =
  /winterreise|schubert|herbstkonzert|kammerchor elikuren präsentiert/i;

const TARGET_PERFORMANCES = [
  {
    startsAt: "2026-09-27T17:00",
    location: "HMT Leipzig",
    address: "Grassistraße 8, 04107 Leipzig",
    label: "Leipzig",
    sortOrder: 0,
  },
  {
    startsAt: "2026-10-11T17:00",
    location: "Kath. Pfarrkirche St. Bonifatius",
    address: "Wunstorf",
    label: "Wunstorf",
    sortOrder: 1,
  },
] as const;

function isApply(argv: string[]) {
  return argv.includes("--apply");
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function main() {
  const apply = isApply(process.argv);
  const connectionString = requireEnv("DATABASE_URL");
  const pool = new pg.Pool({
    connectionString,
    ssl: pgSslForConnectionString(connectionString),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const concerts = await prisma.concert.findMany({
      where: {
        OR: [
          { title: { contains: "Winterreise", mode: "insensitive" } },
          { title: { contains: "Herbstkonzert", mode: "insensitive" } },
          { title: { contains: "Schubert", mode: "insensitive" } },
          { subtitle: { contains: "Winterreise", mode: "insensitive" } },
          { description: { contains: "Winterreise", mode: "insensitive" } },
          { programInfo: { contains: "Winterreise", mode: "insensitive" } },
        ],
      },
      include: {
        performances: true,
        _count: {
          select: { items: true, recordings: true, sheetFiles: true },
        },
      },
      orderBy: { startsAt: "asc" },
    });

    if (concerts.length === 0) {
      console.log("No matching Winterreise/Herbstkonzert concerts found.");
      return;
    }

    console.log(
      JSON.stringify(
        {
          mode: apply ? "apply" : "dry-run",
          found: concerts.map((c) => ({
            id: c.id,
            title: c.title,
            websiteStatus: c.websiteStatus,
            isCurrent: c.isCurrent,
            startsAt: c.startsAt,
            location: c.location,
            performanceCount: c.performances.length,
            items: c._count.items,
            recordings: c._count.recordings,
            sheetFiles: c._count.sheetFiles,
          })),
        },
        null,
        2,
      ),
    );

    const keep =
      concerts.find((c) => c.isCurrent) ??
      concerts.find((c) => /schubert/i.test(c.title)) ??
      concerts.find((c) => KEEP_MATCH.test(c.title)) ??
      concerts[0]!;
    const drop = concerts.filter((c) => c.id !== keep.id);

    const parsedPerformances = TARGET_PERFORMANCES.map((p) => ({
      startsAt: parseBerlinDateTimeLocal(p.startsAt),
      endsAt: null as Date | null,
      location: p.location,
      address: p.address,
      label: p.label,
      sortOrder: p.sortOrder,
    }));
    const mirror = mirrorFieldsFromPerformance(
      pickMirrorPerformance(parsedPerformances),
    );

    console.log(
      JSON.stringify(
        {
          keepId: keep.id,
          keepTitle: keep.title,
          dropIds: drop.map((c) => c.id),
          performances: TARGET_PERFORMANCES,
          mirror,
        },
        null,
        2,
      ),
    );

    if (!apply) {
      console.log("Dry-run only. Re-run with --apply to write.");
      return;
    }

    const forceSingle = process.argv.includes("--force-single");
    if (concerts.length < 2 && !forceSingle) {
      throw new Error(
        `Expected at least 2 matching concerts to merge, found ${concerts.length}. ` +
          "Pass --force-single to rewrite a single concert's performances.",
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const other of drop) {
        await tx.sheetFile.updateMany({
          where: { concertId: other.id },
          data: { concertId: keep.id },
        });
        await tx.audioFile.updateMany({
          where: { concertId: other.id },
          data: { concertId: keep.id },
        });
        await tx.concertItem.updateMany({
          where: { concertId: other.id },
          data: { concertId: keep.id },
        });
        await tx.concert.update({
          where: { id: other.id },
          data: {
            websiteStatus: "DRAFT",
            isCurrent: false,
            isVisible: false,
          },
        });
      }

      await tx.concertPerformance.deleteMany({
        where: { concertId: keep.id },
      });
      await tx.concertPerformance.createMany({
        data: parsedPerformances.map((p) => ({
          concertId: keep.id,
          startsAt: p.startsAt,
          endsAt: p.endsAt,
          location: p.location,
          address: p.address,
          label: p.label,
          sortOrder: p.sortOrder,
        })),
      });

      const shouldBeCurrent = keep.isCurrent || drop.some((d) => d.isCurrent);
      await tx.concert.update({
        where: { id: keep.id },
        data: {
          websiteStatus: "PUBLISHED",
          isVisible: true,
          startsAt: mirror.startsAt,
          endsAt: mirror.endsAt,
          location: mirror.location,
          address: mirror.address,
          date: mirror.date,
          ...(shouldBeCurrent ? { isCurrent: true } : {}),
        },
      });

      if (shouldBeCurrent) {
        await tx.concert.updateMany({
          where: { id: { not: keep.id }, isCurrent: true },
          data: { isCurrent: false },
        });
      }
    });

    console.log(
      JSON.stringify({
        ok: true,
        keepId: keep.id,
        archived: drop.map((c) => c.id),
      }),
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
