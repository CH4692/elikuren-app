/**
 * Import members from the local Excel roster into the users table.
 *
 * Usage (from app/):
 *   npx tsx scripts/import-members-xlsx.ts
 *   npx tsx scripts/import-members-xlsx.ts --dry-run
 *
 * Default file: ../Mitgliederliste/Mitgliederliste_Elikuren.xlsx
 */
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import pg from "pg";
import * as XLSX from "xlsx";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

type ParsedMember = {
  firstname: string | null;
  lastname: string | null;
  street: string | null;
  postalCode: string | null;
  location: string | null;
  phone: string | null;
  email: string;
  birthday: Date | null;
  memberSince: Date | null;
};

function cellStr(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  return s || null;
}

/** Excel serial date → UTC date at midnight. */
function excelSerialToDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 1) return null;
  // Excel epoch 1899-12-30 (with Lotus 1900 leap-year bug accounted for by this offset)
  const utc = Date.UTC(1899, 11, 30) + Math.round(n) * 86_400_000;
  const d = new Date(utc);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findHeaderRow(rows: unknown[][]): {
  index: number;
  map: Record<string, number>;
} | null {
  const aliases: Record<string, string[]> = {
    firstname: ["vorname"],
    lastname: ["nachname"],
    street: ["strasse", "straße", "strabe"],
    postalCode: ["plz"],
    location: ["ort"],
    phone: ["tel.", "tel", "telefon"],
    email: ["e-mail", "email"],
    birthday: ["geburtstag"],
    memberSince: ["mitglied seit"],
  };

  for (let i = 0; i < Math.min(rows.length, 10); i += 1) {
    const row = rows[i] ?? [];
    const map: Record<string, number> = {};
    for (let c = 0; c < row.length; c += 1) {
      const h = normalizeHeader(row[c]);
      for (const [key, names] of Object.entries(aliases)) {
        if (names.includes(h)) map[key] = c;
      }
    }
    if (map.email != null && map.firstname != null && map.lastname != null) {
      return { index: i, map };
    }
  }
  return null;
}

function parseWorkbook(filePath: string): ParsedMember[] {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("Workbook has no sheets");
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  const header = findHeaderRow(rows);
  if (!header) {
    throw new Error("Could not find header row (Vorname/Nachname/E-Mail)");
  }

  const members: ParsedMember[] = [];
  for (let i = header.index + 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const email = cellStr(row[header.map.email])?.toLowerCase();
    if (!email || !email.includes("@")) continue;

    members.push({
      firstname: cellStr(row[header.map.firstname]),
      lastname: cellStr(row[header.map.lastname]),
      street:
        header.map.street != null ? cellStr(row[header.map.street]) : null,
      postalCode:
        header.map.postalCode != null
          ? cellStr(row[header.map.postalCode])
          : null,
      location:
        header.map.location != null ? cellStr(row[header.map.location]) : null,
      phone: header.map.phone != null ? cellStr(row[header.map.phone]) : null,
      email,
      birthday:
        header.map.birthday != null
          ? excelSerialToDate(row[header.map.birthday])
          : null,
      memberSince:
        header.map.memberSince != null
          ? excelSerialToDate(row[header.map.memberSince])
          : null,
    });
  }
  return members;
}

function redactEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const head = user.slice(0, 1) || "*";
  return `${head}***@${domain}`;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const fileArg = process.argv.find((a) => a.endsWith(".xlsx"));
  const filePath = path.resolve(
    process.cwd(),
    fileArg || "../Mitgliederliste/Mitgliederliste_Elikuren.xlsx",
  );

  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const members = parseWorkbook(filePath);
  console.log(`Parsed ${members.length} members with email from roster.`);

  if (dryRun) {
    console.log("Dry run — no database changes.");
    return;
  }

  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const pool = new pg.Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    for (const m of members) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: m.email },
          select: { id: true },
        });

        const data = {
          firstname: m.firstname,
          lastname: m.lastname,
          street: m.street,
          houseNumber: null as string | null,
          postalCode: m.postalCode,
          location: m.location,
          phone: m.phone,
          birthday: m.birthday,
          memberSince: m.memberSince,
          name: [m.firstname, m.lastname].filter(Boolean).join(" ") || null,
          isActive: true,
        };

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data,
          });
          updated += 1;
        } else {
          await prisma.user.create({
            data: {
              email: m.email,
              role: "mitglied",
              ...data,
            },
          });
          created += 1;
        }
      } catch (err) {
        skipped += 1;
        const msg = err instanceof Error ? err.message : "unknown error";
        errors.push(`${redactEmail(m.email)}: ${msg}`);
      }
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  console.log(
    JSON.stringify(
      { created, updated, skipped, errorCount: errors.length, errors },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
