/**
 * Add a small set of REAL media files to Preview (not a full Production clone).
 *
 *   TARGET_ENV=preview PREVIEW_SEED_CONFIRM=1 \
 *   PREVIEW_DATABASE_HOST=ep-....neon.tech \
 *   npx tsx ./scripts/seed-preview-sample-media.ts --confirm
 *
 * Default: 3 sheets, 3 practice audios, 3 pictures from local source folders.
 */
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import type { AudioType, VoiceGroup } from "../lib/generated/prisma/client";
import { PrismaClient } from "../lib/generated/prisma/client";
import { databaseHost } from "../lib/db-url";
import {
  connectionStringFromEnv,
  requireConfirm,
} from "../lib/env-guards";
import { objectKeyFor } from "../lib/object-keys";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { r2Configured, r2Endpoint } from "../lib/r2";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });
loadEnv({ path: ".env.wipe", override: true, quiet: true });

const PREVIEW_BUCKET = "elikuren-music";
const PREVIEW_HOST_MARKER = "ep-rapid-credit-ag46ehg9";
const APP_ROOT = process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, "..");

type Sample = {
  localPath: string;
  title: string;
  composer?: string;
  voiceGroup?: VoiceGroup | null;
  audioType?: AudioType;
};

const SHEETS: Sample[] = [
  {
    localPath: path.join(REPO_ROOT, "noten/Goodnight.pdf"),
    title: "Goodnight",
    composer: "Sample",
    voiceGroup: "ELIKUREN",
  },
  {
    localPath: path.join(REPO_ROOT, "noten/Locus iste, Bruckner.pdf"),
    title: "Locus iste",
    composer: "Bruckner",
    voiceGroup: "ELIKUREN",
  },
  {
    localPath: path.join(REPO_ROOT, "noten/Zum Abendsegen.pdf"),
    title: "Zum Abendsegen",
    composer: "Sample",
    voiceGroup: "ELIKUREN",
  },
];

const AUDIOS: Sample[] = [
  {
    localPath: path.join(
      REPO_ROOT,
      "Übungsdateien/Auf_dem_Flusse/07.Auf dem Flusse-Chor-Sopran.mp3",
    ),
    title: "Auf dem Flusse — Sopran",
    composer: "Schubert",
    voiceGroup: "SOPRANO",
    audioType: "SOPRANO",
  },
  {
    localPath: path.join(
      REPO_ROOT,
      "Übungsdateien/Auf_dem_Flusse/07.Auf dem Flusse-Chor-Alt.mp3",
    ),
    title: "Auf dem Flusse — Alt",
    composer: "Schubert",
    voiceGroup: "ALTO",
    audioType: "ALTO",
  },
  {
    localPath: path.join(
      REPO_ROOT,
      "Übungsdateien/Auf_dem_Flusse/07.Auf dem Flusse-Chor-Bass.mp3",
    ),
    title: "Auf dem Flusse — Bass",
    composer: "Schubert",
    voiceGroup: "BASS",
    audioType: "BASS",
  },
];

const PICTURES: Sample[] = [
  {
    localPath: path.join(REPO_ROOT, "pictures/20120524_Benefiz_Ghana.jpeg"),
    title: "Benefiz Ghana 1",
  },
  {
    localPath: path.join(REPO_ROOT, "pictures/20120524_Benefiz_Ghana_2.jpeg"),
    title: "Benefiz Ghana 2",
  },
  {
    localPath: path.join(REPO_ROOT, "pictures/DSC_3128.jpg"),
    title: "Chorprobe Sample",
  },
];

function assertPreview(env: NodeJS.ProcessEnv) {
  if ((env.TARGET_ENV || "").toLowerCase() !== "preview") {
    throw new Error("Refusing: set TARGET_ENV=preview");
  }
  const url = connectionStringFromEnv(env);
  const host = databaseHost(url);
  if (!host.includes(PREVIEW_HOST_MARKER)) {
    throw new Error(`Refusing: unexpected DB host ${host}`);
  }
  const previewHost = env.PREVIEW_DATABASE_HOST?.trim().toLowerCase();
  if (previewHost && !host.includes(previewHost)) {
    throw new Error(`Refusing: host mismatch ${host}`);
  }
  const bucket = env.R2_BUCKET_NAME?.trim() || PREVIEW_BUCKET;
  if (bucket !== PREVIEW_BUCKET) {
    throw new Error(`Refusing: bucket ${bucket}`);
  }
  return { url, host, bucket };
}

function mimeFor(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  throw new Error(`Unsupported file type: ${filePath}`);
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk as Buffer);
  }
  return hash.digest("hex");
}

function r2Client() {
  return new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

async function uploadFile(
  prisma: PrismaClient,
  client: S3Client,
  bucket: string,
  input: {
    localPath: string;
    category: "SHEET" | "AUDIO" | "IMAGE";
    publicWebsite?: boolean;
    audioKind?: "practice" | "concerts" | "other";
    concertId?: string;
  },
) {
  const body = await fs.readFile(input.localPath);
  const id = randomUUID();
  const originalName = path.basename(input.localPath);
  const mimeType = mimeFor(input.localPath);
  const extension = path.extname(originalName).replace(/^\./, "") || "bin";
  const objectKey = objectKeyFor({
    category: input.category,
    extension,
    fileId: id,
    publicWebsite: input.publicWebsite,
    audioKind: input.audioKind,
    concertId: input.concertId,
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: mimeType,
      ContentLength: body.length,
    }),
  );

  return prisma.storedFile.create({
    data: {
      id,
      objectKey,
      originalName,
      mimeType,
      sizeBytes: body.length,
      checksum: await sha256File(input.localPath),
      category: input.category,
      visibility: input.publicWebsite ? "PUBLIC" : "MEMBERS",
      uploadStatus: "READY",
    },
  });
}

async function main() {
  requireConfirm("PREVIEW_SEED_CONFIRM", "--confirm", process.argv);
  const { url, host, bucket } = assertPreview(process.env);
  if (!r2Configured()) throw new Error("R2 not configured");

  for (const sample of [...SHEETS, ...AUDIOS, ...PICTURES]) {
    await fs.access(sample.localPath);
  }

  console.log(
    JSON.stringify({
      target: "preview-sample-media",
      databaseHost: host,
      r2Bucket: bucket,
      sheets: SHEETS.length,
      audios: AUDIOS.length,
      pictures: PICTURES.length,
    }),
  );

  const pool = new pg.Pool({
    connectionString: url,
    ssl: pgSslForConnectionString(url),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const client = r2Client();

  try {
    const current =
      (await prisma.concert.findFirst({ where: { isCurrent: true } })) ||
      (await prisma.concert.findFirst({
        where: { slug: "preview-fruehjahrskonzert" },
      }));

    const created = { sheets: 0, audios: 0, pictures: 0 };

    for (const sample of SHEETS) {
      const stored = await uploadFile(prisma, client, bucket, {
        localPath: sample.localPath,
        category: "SHEET",
      });
      const sheet = await prisma.sheetFile.create({
        data: {
          title: sample.title,
          composer: sample.composer ?? "",
          storedFileId: stored.id,
          voiceGroup: sample.voiceGroup ?? null,
          isVisible: true,
          concertId: current?.id ?? null,
        },
      });
      if (current) {
        const max = await prisma.concertItem.aggregate({
          where: { concertId: current.id },
          _max: { sortOrder: true },
        });
        await prisma.concertItem.create({
          data: {
            concertId: current.id,
            title: sample.title,
            sortOrder: (max._max.sortOrder ?? 0) + 1,
            sheetFileId: sheet.id,
            ensemble: sample.voiceGroup ?? "ELIKUREN",
          },
        });
      }
      created.sheets += 1;
      console.log(`sheet: ${sample.title} (${stored.sizeBytes} bytes)`);
    }

    for (const sample of AUDIOS) {
      const stored = await uploadFile(prisma, client, bucket, {
        localPath: sample.localPath,
        category: "AUDIO",
        audioKind: "practice",
      });
      await prisma.audioFile.create({
        data: {
          title: sample.title,
          composer: sample.composer ?? "",
          storedFileId: stored.id,
          audioType: sample.audioType ?? "REHEARSAL",
          voiceGroup: sample.voiceGroup ?? null,
          isVisible: true,
          concertId: current?.id ?? null,
        },
      });
      created.audios += 1;
      console.log(`audio: ${sample.title} (${stored.sizeBytes} bytes)`);
    }

    for (const [index, sample] of PICTURES.entries()) {
      const stored = await uploadFile(prisma, client, bucket, {
        localPath: sample.localPath,
        category: "IMAGE",
        publicWebsite: true,
      });
      const asset = await prisma.mediaAsset.create({
        data: {
          title: sample.title,
          altText: sample.title,
          storedFileId: stored.id,
          isActive: true,
          sortOrder: index + 10,
        },
      });
      if (index === 0 && current && !current.heroImageId) {
        await prisma.concert.update({
          where: { id: current.id },
          data: { heroImageId: asset.id },
        });
      }
      created.pictures += 1;
      console.log(`picture: ${sample.title} (${stored.sizeBytes} bytes)`);
    }

    console.log("Sample media seed complete");
    console.log(
      JSON.stringify(
        {
          ...created,
          totals: {
            sheets: await prisma.sheetFile.count(),
            audios: await prisma.audioFile.count(),
            media: await prisma.mediaAsset.count(),
            files: await prisma.storedFile.count(),
          },
        },
        null,
        2,
      ),
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
