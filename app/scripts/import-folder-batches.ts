/**
 * Import the three local batch folders into R2 + Prisma:
 *   - Leipzig 08. - 09.03.2025  → concert recordings (new "Leipzig" concert)
 *   - Leipzig 2026              → scores + practice audio → Schubertkonzert 2026-09-27
 *   - Magenta                   → practice audio (no concert)
 *
 * Usage (from app/):
 *   npx tsx scripts/import-folder-batches.ts
 *   npx tsx scripts/import-folder-batches.ts --apply
 */
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import pg from "pg";

import type {
  AudioType,
  VoiceGroup,
} from "../lib/generated/prisma/client";
import { PrismaClient } from "../lib/generated/prisma/client";
import { objectKeyFor } from "../lib/object-keys";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { r2Configured, r2Endpoint } from "../lib/r2";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const APP_ROOT = process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, "..");
const MANIFEST_PATH = path.join(
  APP_ROOT,
  "scripts",
  "import-folder-batches-manifest.json",
);

type EntryKind = "sheet" | "practice_audio" | "concert_recording";

type BatchEntry = {
  kind: EntryKind;
  localPath: string;
  title: string;
  composer?: string;
  voiceGroup?: VoiceGroup | null;
  audioType?: AudioType;
  concertTarget?: "schubert_2026" | "leipzig_2025" | null;
  sizeBytes: number;
  checksum: string;
  mimeType: string;
  originalName: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  const stream = createReadStream(filePath);
  for await (const chunk of stream) {
    hash.update(chunk as Buffer);
  }
  return hash.digest("hex");
}

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

function titleFromBasename(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/_/g, " ").trim();
}

function mimeForAudio(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  return null;
}

function isPrintPdf(fileName: string) {
  const n = fileName.toLowerCase();
  return (
    n.includes("booklet") ||
    n.includes("cd-print") ||
    n.includes("inlet") ||
    n.endsWith(".md")
  );
}

/** Parse voice highlight from Winterreise / practice filenames. */
function parseVoiceFromName(fileName: string): {
  voiceGroup: VoiceGroup | null;
  audioType: AudioType;
  title: string;
} {
  const base = titleFromBasename(fileName);
  const lower = base.toLowerCase();

  const voiceMatchers: { re: RegExp; voice: VoiceGroup; type: AudioType }[] = [
    { re: /sopran/i, voice: "SOPRANO", type: "SOPRANO" },
    { re: /tenor/i, voice: "TENOR", type: "TENOR" },
    { re: /bass|baß/i, voice: "BASS", type: "BASS" },
    { re: /(^|[^a-zäöü])alt([^a-zäöü]|$)/i, voice: "ALTO", type: "ALTO" },
    { re: /mezzo/i, voice: "OTHER", type: "OTHER" },
  ];

  for (const m of voiceMatchers) {
    if (m.re.test(base)) {
      const title = base
        .replace(/[-–_\s]*(Chor[-–_\s]*)?(Sopran|Alt|Tenor|Bass|Baß|Mezzo)\s*$/i, "")
        .replace(/[-–_\s]+$/g, "")
        .trim();
      return {
        voiceGroup: m.voice,
        audioType: m.type,
        title: title || base,
      };
    }
  }

  if (/\bchor\b/i.test(lower) || /[-–_]chor$/i.test(lower)) {
    const title = base
      .replace(/[-–_\s]*Chor\s*$/i, "")
      .replace(/[-–_\s]+$/g, "")
      .trim();
    return {
      voiceGroup: "ELIKUREN",
      audioType: "FULL_RECORDING",
      title: title || base,
    };
  }

  return { voiceGroup: null, audioType: "REHEARSAL", title: base };
}

async function scanLeipzig2025(root: string): Promise<BatchEntry[]> {
  const entries: BatchEntry[] = [];
  const files = await listFiles(root);
  for (const file of files) {
    const originalName = path.basename(file);
    if (isPrintPdf(originalName)) continue;
    const mimeType = mimeForAudio(originalName);
    if (!mimeType) continue;
    const { size } = await fs.stat(file);
    const checksum = await sha256File(file);
    entries.push({
      kind: "concert_recording",
      localPath: file,
      title: titleFromBasename(originalName),
      audioType: "CONCERT_RECORDING",
      concertTarget: "leipzig_2025",
      sizeBytes: size,
      checksum,
      mimeType,
      originalName,
    });
  }
  return entries;
}

async function scanLeipzig2026(root: string): Promise<BatchEntry[]> {
  const entries: BatchEntry[] = [];
  const files = await listFiles(root);
  for (const file of files) {
    const originalName = path.basename(file);
    if (isPrintPdf(originalName) || /\.md$/i.test(originalName)) continue;

    const { size } = await fs.stat(file);
    const checksum = await sha256File(file);

    if (/\.pdf$/i.test(originalName)) {
      entries.push({
        kind: "sheet",
        localPath: file,
        title: titleFromBasename(originalName),
        composer: "Schubert",
        concertTarget: "schubert_2026",
        sizeBytes: size,
        checksum,
        mimeType: "application/pdf",
        originalName,
      });
      continue;
    }

    const mimeType = mimeForAudio(originalName);
    if (!mimeType) continue;
    const parsed = parseVoiceFromName(originalName);
    entries.push({
      kind: "practice_audio",
      localPath: file,
      title: parsed.title,
      composer: "Schubert",
      voiceGroup: parsed.voiceGroup,
      audioType: parsed.audioType,
      concertTarget: "schubert_2026",
      sizeBytes: size,
      checksum,
      mimeType,
      originalName,
    });
  }
  return entries;
}

async function scanMagenta(root: string): Promise<BatchEntry[]> {
  const entries: BatchEntry[] = [];
  const files = await listFiles(root);
  for (const file of files) {
    const originalName = path.basename(file);
    const mimeType = mimeForAudio(originalName);
    if (!mimeType) continue;
    const { size } = await fs.stat(file);
    const checksum = await sha256File(file);
    const parsed = parseVoiceFromName(originalName);
    entries.push({
      kind: "practice_audio",
      localPath: file,
      title: parsed.title,
      voiceGroup: parsed.voiceGroup,
      audioType: parsed.audioType === "FULL_RECORDING" ? "REHEARSAL" : parsed.audioType,
      concertTarget: null,
      sizeBytes: size,
      checksum,
      mimeType,
      originalName,
    });
  }
  return entries;
}

function getR2Client() {
  return new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });
}

async function uploadAndCreateStoredFile(
  prisma: PrismaClient,
  client: S3Client,
  entry: BatchEntry,
  category: "SHEET" | "AUDIO",
  opts?: { concertId?: string | null },
) {
  const existing = await prisma.storedFile.findFirst({
    where: {
      checksum: entry.checksum,
      deletedAt: null,
      uploadStatus: "READY",
      category,
    },
  });
  if (existing) return existing;

  const fileId = randomUUID();
  const ext = path.extname(entry.originalName).replace(/^\./, "") || "bin";
  const audioKind =
    category === "AUDIO"
      ? entry.kind === "concert_recording"
        ? ("concerts" as const)
        : ("practice" as const)
      : undefined;

  const objectKey = objectKeyFor({
    category,
    fileId,
    extension: ext,
    concertId: opts?.concertId,
    audioKind,
  });

  console.log(`  PUT ${objectKey} (${entry.sizeBytes} bytes)`);
  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: objectKey,
      Body: createReadStream(entry.localPath),
      ContentType: entry.mimeType,
      ContentLength: entry.sizeBytes,
    }),
  );

  return prisma.storedFile.create({
    data: {
      id: fileId,
      objectKey,
      originalName: entry.originalName,
      mimeType: entry.mimeType,
      sizeBytes: entry.sizeBytes,
      checksum: entry.checksum,
      category,
      visibility: "MEMBERS",
      uploadStatus: "READY",
    },
  });
}

async function resolveConcertIds(prisma: PrismaClient) {
  const schubert = await prisma.concert.findFirst({
    where: {
      title: "Schubertkonzert",
      date: new Date("2026-09-27T00:00:00.000Z"),
    },
    select: { id: true, slug: true, isCurrent: true },
  });
  if (!schubert) {
    throw new Error(
      "Schubertkonzert 2026-09-27 not found — create/activate it before import",
    );
  }

  const leipzigSlug = slugify("Leipzig 2025-03-08");
  let leipzig = await prisma.concert.findUnique({
    where: { slug: leipzigSlug },
    select: { id: true, slug: true },
  });
  let leipzigCreated = false;
  if (!leipzig) {
    const byTitle = await prisma.concert.findFirst({
      where: {
        title: "Leipzig",
        date: new Date("2025-03-08T00:00:00.000Z"),
      },
      select: { id: true, slug: true },
    });
    if (byTitle) {
      leipzig = byTitle;
    } else {
      leipzig = await prisma.concert.create({
        data: {
          title: "Leipzig",
          slug: leipzigSlug,
          date: new Date("2025-03-08T00:00:00.000Z"),
          location: "HMT Leipzig",
          isVisible: true,
          isCurrent: false,
        },
        select: { id: true, slug: true },
      });
      leipzigCreated = true;
    }
  }

  return { schubert, leipzig, leipzigCreated };
}

async function applyImport(prisma: PrismaClient, entries: BatchEntry[]) {
  if (!r2Configured()) {
    throw new Error("R2 env vars missing – cannot --apply");
  }
  const client = getR2Client();
  const { schubert, leipzig, leipzigCreated } = await resolveConcertIds(prisma);

  let sheets = 0;
  let audios = 0;
  let items = 0;
  let skipped = 0;
  let concertsCreated = leipzigCreated ? 1 : 0;

  for (const entry of entries) {
    const concertId =
      entry.concertTarget === "schubert_2026"
        ? schubert.id
        : entry.concertTarget === "leipzig_2025"
          ? leipzig.id
          : null;

    if (entry.kind === "sheet") {
      const stored = await uploadAndCreateStoredFile(
        prisma,
        client,
        entry,
        "SHEET",
      );
      let sheet = await prisma.sheetFile.findFirst({
        where: { storedFileId: stored.id },
      });
      if (!sheet) {
        sheet = await prisma.sheetFile.create({
          data: {
            title: entry.title,
            composer: entry.composer ?? "",
            storedFileId: stored.id,
            accessScope: "ALL_MEMBERS",
            isVisible: true,
            concertId,
            voiceGroup: "ELIKUREN",
          },
        });
        sheets += 1;
      } else {
        if (concertId && !sheet.concertId) {
          sheet = await prisma.sheetFile.update({
            where: { id: sheet.id },
            data: { concertId },
          });
        }
        skipped += 1;
      }

      if (concertId) {
        const existingItem = await prisma.concertItem.findFirst({
          where: { concertId, sheetFileId: sheet.id },
        });
        if (!existingItem) {
          const max = await prisma.concertItem.aggregate({
            where: { concertId },
            _max: { sortOrder: true },
          });
          await prisma.concertItem.create({
            data: {
              concertId,
              title: entry.title,
              sortOrder: (max._max.sortOrder ?? 0) + 1,
              sheetFileId: sheet.id,
              ensemble: "ELIKUREN",
            },
          });
          items += 1;
        }
      }
      continue;
    }

    if (entry.kind === "practice_audio") {
      const stored = await uploadAndCreateStoredFile(
        prisma,
        client,
        entry,
        "AUDIO",
        { concertId },
      );
      const existing = await prisma.audioFile.findFirst({
        where: { storedFileId: stored.id },
      });
      if (existing) {
        if (concertId && !existing.concertId) {
          await prisma.audioFile.update({
            where: { id: existing.id },
            data: { concertId },
          });
        }
        skipped += 1;
        continue;
      }
      await prisma.audioFile.create({
        data: {
          title: entry.title,
          composer: entry.composer ?? "",
          storedFileId: stored.id,
          audioType: entry.audioType ?? "REHEARSAL",
          voiceGroup: entry.voiceGroup ?? null,
          accessScope: "ALL_MEMBERS",
          isVisible: true,
          concertId,
        },
      });
      audios += 1;
      continue;
    }

    if (entry.kind === "concert_recording") {
      if (!concertId) continue;
      const stored = await uploadAndCreateStoredFile(
        prisma,
        client,
        entry,
        "AUDIO",
        { concertId },
      );
      const existing = await prisma.audioFile.findFirst({
        where: { storedFileId: stored.id, concertId },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      await prisma.audioFile.create({
        data: {
          title: entry.title,
          storedFileId: stored.id,
          audioType: "CONCERT_RECORDING",
          concertId,
          accessScope: "ALL_MEMBERS",
          isVisible: true,
        },
      });
      audios += 1;
    }
  }

  // Never flip the active concert — verify Schubert remains current if it was.
  if (schubert.isCurrent) {
    const stillCurrent = await prisma.concert.findFirst({
      where: { id: schubert.id, isCurrent: true },
      select: { id: true },
    });
    if (!stillCurrent) {
      await prisma.concert.updateMany({ data: { isCurrent: false } });
      await prisma.concert.update({
        where: { id: schubert.id },
        data: { isCurrent: true },
      });
      console.log("Restored Schubertkonzert as current concert.");
    }
  }

  return {
    sheets,
    audios,
    items,
    skipped,
    concertsCreated,
    schubertId: schubert.id,
    leipzigId: leipzig.id,
  };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const leipzig2025 = path.join(REPO_ROOT, "Leipzig 08. - 09.03.2025");
  const leipzig2026 = path.join(REPO_ROOT, "Leipzig 2026");
  const magenta = path.join(REPO_ROOT, "Magenta");

  console.log(`Repo root: ${REPO_ROOT}`);
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);

  const entries: BatchEntry[] = [
    ...(await scanLeipzig2025(leipzig2025)),
    ...(await scanLeipzig2026(leipzig2026)),
    ...(await scanMagenta(magenta)),
  ];

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf8");

  const counts = {
    total: entries.length,
    sheets: entries.filter((e) => e.kind === "sheet").length,
    practice: entries.filter((e) => e.kind === "practice_audio").length,
    concertRecordings: entries.filter((e) => e.kind === "concert_recording")
      .length,
    schubert: entries.filter((e) => e.concertTarget === "schubert_2026").length,
    leipzig2025: entries.filter((e) => e.concertTarget === "leipzig_2025")
      .length,
    noConcert: entries.filter((e) => e.concertTarget == null).length,
  };
  console.log(`Wrote manifest: ${MANIFEST_PATH}`);
  console.log(JSON.stringify(counts, null, 2));

  if (!apply) {
    console.log("Dry-run complete. Re-run with --apply to upload.");
    return;
  }

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const pool = new pg.Pool({
    connectionString,
    ssl: pgSslForConnectionString(connectionString),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const result = await applyImport(prisma, entries);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
