/**
 * Bulk-import local media folders into R2 + Prisma.
 *
 * Usage (from app/):
 *   npx tsx scripts/import-media.ts              # dry-run → scripts/import-manifest.json
 *   npx tsx scripts/import-media.ts --apply      # upload + DB writes
 *   npx tsx scripts/import-media.ts --apply --only=scores,practice,concerts,pictures
 *   npx tsx scripts/import-media.ts --apply --current-slug=neujahrskonzert-2025
 */
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import type {
  AudioType,
  VoiceGroup,
} from "../lib/generated/prisma/client";
import { PrismaClient } from "../lib/generated/prisma/client";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { objectKeyFor } from "../lib/object-keys";
import { r2Configured, r2Endpoint } from "../lib/r2";
import { loadTargetEnv } from "./load-target-env";

loadTargetEnv();

/** Expect `npm run import:media` from the app/ directory. */
const APP_ROOT = process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, "..");
const MANIFEST_PATH = path.join(APP_ROOT, "scripts", "import-manifest.json");

type Section = "scores" | "practice" | "concerts" | "pictures";

type ManifestEntry = {
  kind: "sheet" | "practice_audio" | "concert_recording" | "picture";
  localPath: string;
  title: string;
  composer?: string;
  voiceGroup?: VoiceGroup | null;
  audioType?: AudioType;
  concertFolder?: string;
  concertTitle?: string;
  concertDate?: string | null;
  takenAt?: string | null;
  sortOrder?: number;
  sizeBytes: number;
  checksum: string;
  mimeType: string;
  originalName: string;
};

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply");
  const onlyArg = argv.find((a) => a.startsWith("--only="))?.slice(7);
  const currentSlug =
    argv.find((a) => a.startsWith("--current-slug="))?.slice(15) || null;
  const only = new Set<Section>(
    onlyArg
      ? (onlyArg.split(",").map((s) => s.trim()) as Section[])
      : ["scores", "practice", "concerts"],
  );
  return { apply, only, currentSlug };
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

function voiceFromName(name: string): VoiceGroup | null {
  const n = name.toLowerCase();
  if (/sopran/.test(n)) return "SOPRANO";
  if (/tenor/.test(n)) return "TENOR";
  if (/bass|baß/.test(n)) return "BASS";
  if (/(^|[^a-z])alt([^a-z]|$)/.test(n) || /-alt\./.test(n)) return "ALTO";
  return null;
}

function titleFromBasename(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/_/g, " ").trim();
}

function takenAtFromName(fileName: string): string | null {
  const m = fileName.match(/^(\d{4})(\d{2})(\d{2})[_-]/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function mimeForImage(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return null;
}

async function scanPictures(root: string): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  const files = await listFiles(root);
  for (const file of files) {
    const originalName = path.basename(file);
    const mimeType = mimeForImage(originalName);
    if (!mimeType) continue;
    const { size } = await fs.stat(file);
    const checksum = await sha256File(file);
    const takenAt = takenAtFromName(originalName);
    let title = titleFromBasename(originalName);
    if (takenAt) {
      title = title.replace(/^\d{4}[-\s]?\d{2}[-\s]?\d{2}\s*/, "").trim() || title;
    }
    entries.push({
      kind: "picture",
      localPath: file,
      title,
      takenAt,
      sizeBytes: size,
      checksum,
      mimeType,
      originalName,
    });
  }
  return entries;
}

function parseConcertFolder(folderName: string): {
  title: string;
  date: string | null;
} {
  const fullDate = folderName.match(
    /^(\d{4}-\d{2}-\d{2})\s*[-–]\s*(.+)$/,
  );
  if (fullDate) {
    return { date: fullDate[1], title: fullDate[2].trim() };
  }
  const yearOnly = folderName.match(/^(\d{4})\s*[-–]\s*(.+)$/);
  if (yearOnly) {
    return { date: `${yearOnly[1]}-01-01`, title: yearOnly[2].trim() };
  }
  return { date: null, title: folderName.trim() };
}

function parseTrackName(fileName: string): { sortOrder: number; title: string } {
  const base = titleFromBasename(fileName);
  const m = base.match(/^(\d+)\s*[-–.]\s*(.+)$/);
  if (m) return { sortOrder: Number(m[1]), title: m[2].trim() };
  return { sortOrder: 0, title: base };
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

async function scanScores(notenRoot: string): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  let top: string[];
  try {
    top = await fs.readdir(notenRoot);
  } catch {
    console.warn(`Missing noten folder: ${notenRoot}`);
    return entries;
  }

  for (const name of top) {
    if (name.startsWith(".")) continue;
    const full = path.join(notenRoot, name);
    const st = await fs.stat(full);
    if (st.isDirectory()) {
      const files = await listFiles(full);
      for (const file of files) {
        if (!/\.pdf$/i.test(file)) continue;
        const originalName = path.basename(file);
        const { size } = await fs.stat(file);
        const checksum = await sha256File(file);
        const { title: concertTitle, date } = parseConcertFolder(name);
        entries.push({
          kind: "sheet",
          localPath: file,
          title: titleFromBasename(originalName),
          concertFolder: name,
          concertTitle,
          concertDate: date,
          sizeBytes: size,
          checksum,
          mimeType: "application/pdf",
          originalName,
        });
      }
    } else if (/\.pdf$/i.test(name)) {
      const checksum = await sha256File(full);
      entries.push({
        kind: "sheet",
        localPath: full,
        title: titleFromBasename(name),
        sizeBytes: st.size,
        checksum,
        mimeType: "application/pdf",
        originalName: name,
      });
    }
  }
  return entries;
}

async function scanPractice(root: string): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  const files = await listFiles(root);
  for (const file of files) {
    if (!/\.mp3$/i.test(file)) continue;
    const originalName = path.basename(file);
    const pieceFolder = path.basename(path.dirname(file));
    const { size } = await fs.stat(file);
    const checksum = await sha256File(file);
    const voiceGroup = voiceFromName(originalName);
    const title =
      pieceFolder && pieceFolder !== "Übungsdateien"
        ? pieceFolder.replace(/_/g, " ")
        : titleFromBasename(originalName);
    entries.push({
      kind: "practice_audio",
      localPath: file,
      title,
      voiceGroup,
      audioType: "REHEARSAL",
      sizeBytes: size,
      checksum,
      mimeType: "audio/mpeg",
      originalName,
    });
  }
  return entries;
}

async function scanConcerts(root: string): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  let folders: string[];
  try {
    folders = await fs.readdir(root);
  } catch {
    console.warn(`Missing konzertaufnahmen folder: ${root}`);
    return entries;
  }

  for (const folder of folders) {
    if (folder.startsWith(".")) continue;
    const dir = path.join(root, folder);
    const st = await fs.stat(dir);
    if (!st.isDirectory()) continue;
    const { title: concertTitle, date } = parseConcertFolder(folder);
    const files = await listFiles(dir);
    for (const file of files) {
      if (!/\.mp3$/i.test(file)) continue;
      const originalName = path.basename(file);
      const track = parseTrackName(originalName);
      const { size } = await fs.stat(file);
      const checksum = await sha256File(file);
      entries.push({
        kind: "concert_recording",
        localPath: file,
        title: track.title,
        sortOrder: track.sortOrder,
        concertFolder: folder,
        concertTitle,
        concertDate: date,
        audioType: "CONCERT_RECORDING",
        sizeBytes: size,
        checksum,
        mimeType: "audio/mpeg",
        originalName,
      });
    }
  }
  return entries;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
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
  entry: ManifestEntry,
  category: "SHEET" | "AUDIO" | "IMAGE",
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
        : entry.kind === "practice_audio"
          ? ("practice" as const)
          : ("other" as const)
      : undefined;
  const objectKey = objectKeyFor({
    category,
    fileId,
    extension: ext,
    concertId: opts?.concertId,
    audioKind,
  });

  console.log(`  PUT ${objectKey} (${entry.sizeBytes} bytes)`);
  const maxAttempts = 4;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: requireEnv("R2_BUCKET_NAME"),
          Key: objectKey,
          Body: createReadStream(entry.localPath),
          ContentType: entry.mimeType,
          ContentLength: entry.sizeBytes,
        }),
      );
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      const name =
        err && typeof err === "object" && "name" in err
          ? String((err as { name?: string }).name)
          : "";
      const retryable =
        code === "EPIPE" ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT" ||
        name === "TimeoutError" ||
        name === "AbortError";
      if (!retryable || attempt === maxAttempts) throw err;
      const delayMs = attempt * 1500;
      console.warn(
        `  retry ${attempt}/${maxAttempts - 1} after ${name || code} (${delayMs}ms)`,
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  if (lastError) throw lastError;

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

async function ensureConcert(
  prisma: PrismaClient,
  title: string,
  date: string | null | undefined,
  slugHint?: string,
): Promise<{ concert: { id: string }; created: boolean }> {
  const slug = slugify(slugHint || title);
  const existing = await prisma.concert.findUnique({ where: { slug } });
  if (existing) return { concert: existing, created: false };
  const concert = await prisma.concert.create({
    data: {
      title,
      slug,
      date: date ? new Date(`${date}T00:00:00.000Z`) : null,
      isVisible: true,
      isCurrent: false,
    },
  });
  return { concert, created: true };
}

async function applyImport(
  prisma: PrismaClient,
  entries: ManifestEntry[],
  currentSlug: string | null,
) {
  if (!r2Configured()) {
    throw new Error("R2 env vars missing – cannot --apply");
  }
  const client = getR2Client();
  let sheets = 0;
  let audios = 0;
  let pictures = 0;
  let concerts = 0;
  let items = 0;
  let skipped = 0;

  const concertCache = new Map<string, string>();

  for (const entry of entries) {
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
      if (entry.concertFolder && entry.concertTitle) {
        const key = entry.concertFolder;
        let concertId = concertCache.get(key);
        if (!concertId) {
          const { concert, created } = await ensureConcert(
            prisma,
            entry.concertTitle,
            entry.concertDate,
            entry.concertFolder,
          );
          concertId = concert.id;
          concertCache.set(key, concertId);
          if (created) concerts += 1;
        }

        if (!sheet) {
          sheet = await prisma.sheetFile.create({
            data: {
              title: entry.title,
              composer: entry.composer ?? "",
              storedFileId: stored.id,
              accessScope: "ALL_MEMBERS",
              isVisible: true,
              concertId,
            },
          });
          sheets += 1;
        } else {
          if (!sheet.concertId) {
            sheet = await prisma.sheetFile.update({
              where: { id: sheet.id },
              data: { concertId },
            });
          }
          skipped += 1;
        }

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
            },
          });
          items += 1;
        }
      } else if (!sheet) {
        sheet = await prisma.sheetFile.create({
          data: {
            title: entry.title,
            composer: entry.composer ?? "",
            storedFileId: stored.id,
            accessScope: "ALL_MEMBERS",
            isVisible: true,
          },
        });
        sheets += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    if (entry.kind === "picture") {
      const stored = await uploadAndCreateStoredFile(
        prisma,
        client,
        entry,
        "IMAGE",
      );
      const existing = await prisma.mediaAsset.findFirst({
        where: { storedFileId: stored.id },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      await prisma.mediaAsset.create({
        data: {
          title: entry.title,
          altText: entry.title,
          isDecorative: false,
          takenAt: entry.takenAt
            ? new Date(`${entry.takenAt}T00:00:00.000Z`)
            : null,
          storedFileId: stored.id,
          isActive: true,
          isArchived: false,
          sortOrder: 0,
        },
      });
      pictures += 1;
      continue;
    }

    if (entry.kind === "practice_audio") {
      const stored = await uploadAndCreateStoredFile(
        prisma,
        client,
        entry,
        "AUDIO",
      );
      const existing = await prisma.audioFile.findFirst({
        where: { storedFileId: stored.id },
      });
      if (existing) {
        skipped += 1;
        continue;
      }
      await prisma.audioFile.create({
        data: {
          title: entry.title,
          storedFileId: stored.id,
          audioType: entry.audioType ?? "REHEARSAL",
          voiceGroup: entry.voiceGroup ?? null,
          accessScope: "ALL_MEMBERS",
          isVisible: true,
        },
      });
      audios += 1;
      continue;
    }

    if (entry.kind === "concert_recording") {
      if (!entry.concertFolder || !entry.concertTitle) continue;
      const key = entry.concertFolder;
      let concertId = concertCache.get(key);
      if (!concertId) {
        const { concert, created } = await ensureConcert(
          prisma,
          entry.concertTitle,
          entry.concertDate,
          entry.concertFolder,
        );
        concertId = concert.id;
        concertCache.set(key, concertId);
        if (created) concerts += 1;
      }

      const stored = await uploadAndCreateStoredFile(
        prisma,
        client,
        entry,
        "AUDIO",
        { concertId },
      );
      const title = `${String(entry.sortOrder ?? 0).padStart(2, "0")} - ${entry.title}`;
      const existingForConcert = await prisma.audioFile.findFirst({
        where: { storedFileId: stored.id, concertId },
      });
      if (!existingForConcert) {
        await prisma.audioFile.create({
          data: {
            title,
            storedFileId: stored.id,
            audioType: "CONCERT_RECORDING",
            concertId,
            accessScope: "ALL_MEMBERS",
            isVisible: true,
          },
        });
        audios += 1;
      } else {
        skipped += 1;
      }
    }
  }

  const touchedConcerts = entries.some(
    (e) =>
      e.kind === "concert_recording" ||
      (e.kind === "sheet" && Boolean(e.concertFolder)),
  );
  if (touchedConcerts || currentSlug) {
    const slugToMark =
      currentSlug ||
      (
        await prisma.concert.findFirst({
          where: { slug: { contains: "neujahrskonzert-2025" } },
          orderBy: { date: "desc" },
        })
      )?.slug ||
      (
        await prisma.concert.findFirst({
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        })
      )?.slug;

    if (slugToMark) {
      await prisma.concert.updateMany({ data: { isCurrent: false } });
      const updated = await prisma.concert.updateMany({
        where: { slug: slugToMark },
        data: { isCurrent: true },
      });
      if (updated.count === 0) {
        console.warn(`current-slug not found: ${slugToMark}`);
      } else {
        console.log(`Marked current concert: ${slugToMark}`);
      }
    }
  }

  return { sheets, audios, pictures, concerts, items, skipped };
}

async function main() {
  const { apply, only, currentSlug } = parseArgs(process.argv.slice(2));
  const notenRoot = path.join(REPO_ROOT, "noten");
  const practiceRoot = path.join(REPO_ROOT, "Übungsdateien");
  const concertsRoot = path.join(REPO_ROOT, "konzertaufnahmen");
  const picturesRoot = path.join(REPO_ROOT, "pictures");

  console.log(`Repo root: ${REPO_ROOT}`);
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`Sections: ${[...only].join(", ")}`);

  const entries: ManifestEntry[] = [];
  if (only.has("scores")) entries.push(...(await scanScores(notenRoot)));
  if (only.has("practice")) entries.push(...(await scanPractice(practiceRoot)));
  if (only.has("concerts")) entries.push(...(await scanConcerts(concertsRoot)));
  if (only.has("pictures")) entries.push(...(await scanPictures(picturesRoot)));

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf8");
  console.log(`Wrote manifest: ${MANIFEST_PATH}`);
  console.log(
    `Entries: ${entries.length} (sheets=${entries.filter((e) => e.kind === "sheet").length}, practice=${entries.filter((e) => e.kind === "practice_audio").length}, concerts=${entries.filter((e) => e.kind === "concert_recording").length}, pictures=${entries.filter((e) => e.kind === "picture").length})`,
  );

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
    const result = await applyImport(prisma, entries, currentSlug);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
