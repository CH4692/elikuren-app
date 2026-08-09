/**
 * Synthetic Preview seed only — never Production, never real roster/media imports.
 *
 *   TARGET_ENV=preview PREVIEW_SEED_CONFIRM=1 \
 *   PREVIEW_DATABASE_HOST=ep-....neon.tech \
 *   npx tsx ./scripts/seed-preview.ts --confirm
 *
 * Creates clearly labeled fixture data + tiny R2 placeholders.
 */
import { createHash, randomUUID } from "node:crypto";
import { config as loadEnv } from "dotenv";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient, type Role } from "../lib/generated/prisma/client";
import { databaseHost } from "../lib/db-url";
import {
  connectionStringFromEnv,
  requireConfirm,
} from "../lib/env-guards";
import { objectKeyFor } from "../lib/object-keys";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { r2Configured, r2Endpoint } from "../lib/r2";
import { seedSiteContent } from "../lib/site-content/seed";

loadEnv({ path: ".env.test", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });
loadEnv({ path: ".env.wipe", override: true, quiet: true });

const PREVIEW_BUCKET = "elikuren-music";
const PREVIEW_HOST_MARKER = "ep-rapid-credit-ag46ehg9";

/** Minimal valid PDF. */
const TINY_PDF = Buffer.from(
  `%PDF-1.1
1 0 obj<<>>endobj
2 0 obj<< /Length 44 >>stream
BT /F1 12 Tf 100 700 Td (Preview Test) Tj ET
endstream
endobj
3 0 obj<< /Type /Page /Parent 4 0 R /Contents 2 0 R >>endobj
4 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
5 0 obj<< /Type /Catalog /Pages 4 0 R >>endobj
trailer<< /Root 5 0 R >>
%%EOF`,
);

/** 1×1 PNG. */
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/** Tiny placeholder labeled as audio/mpeg (not a real song). */
const TINY_AUDIO = Buffer.from("PREVIEW-TEST-AUDIO-PLACEHOLDER");

function assertPreviewSeedAllowed(env: NodeJS.ProcessEnv) {
  if ((env.TARGET_ENV || "").toLowerCase() !== "preview") {
    throw new Error("Refusing Preview seed: set TARGET_ENV=preview");
  }
  if (env.VERCEL_ENV === "production") {
    throw new Error("Refusing Preview seed: VERCEL_ENV=production");
  }

  const url = connectionStringFromEnv(env);
  const host = databaseHost(url);
  if (!host.includes(PREVIEW_HOST_MARKER)) {
    throw new Error(`Refusing Preview seed: unexpected DB host ${host}`);
  }

  const previewHost = env.PREVIEW_DATABASE_HOST?.trim().toLowerCase();
  if (previewHost && !host.includes(previewHost)) {
    throw new Error(
      `Refusing Preview seed: host ${host} != PREVIEW_DATABASE_HOST=${previewHost}`,
    );
  }

  const prodHost = env.PRODUCTION_DATABASE_HOST?.trim().toLowerCase();
  if (prodHost && host.includes(prodHost)) {
    throw new Error("Refusing Preview seed: DATABASE_URL looks like Production");
  }

  const bucket = env.R2_BUCKET_NAME?.trim();
  if (bucket && bucket !== PREVIEW_BUCKET) {
    throw new Error(
      `Refusing Preview seed: R2_BUCKET_NAME="${bucket}" (expected ${PREVIEW_BUCKET})`,
    );
  }

  return { url, host, bucket: bucket || PREVIEW_BUCKET };
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

async function putObject(
  client: S3Client,
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string,
) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: body.length,
    }),
  );
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
  return prisma.user.upsert({
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
      firstname: input.firstname,
      lastname: input.lastname,
      name: `${input.firstname} ${input.lastname}`,
    },
  });
}

async function createReadyFile(
  prisma: PrismaClient,
  client: S3Client,
  bucket: string,
  input: {
    category: "SHEET" | "AUDIO" | "IMAGE" | "INVOICE";
    extension: string;
    mimeType: string;
    originalName: string;
    body: Buffer;
    visibility?: "PUBLIC" | "MEMBERS" | "ADMIN";
    publicWebsite?: boolean;
    concertId?: string;
    audioKind?: "practice" | "concerts" | "other";
    invoiceId?: string;
  },
) {
  const id = randomUUID();
  const objectKey = objectKeyFor({
    category: input.category,
    extension: input.extension,
    fileId: id,
    concertId: input.concertId,
    audioKind: input.audioKind,
    invoiceId: input.invoiceId,
    publicWebsite: input.publicWebsite,
  });
  await putObject(client, bucket, objectKey, input.body, input.mimeType);
  return prisma.storedFile.create({
    data: {
      id,
      objectKey,
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.body.length,
      checksum: createHash("sha256").update(input.body).digest("hex"),
      category: input.category,
      visibility: input.visibility ?? (input.publicWebsite ? "PUBLIC" : "MEMBERS"),
      uploadStatus: "READY",
    },
  });
}

async function main() {
  requireConfirm("PREVIEW_SEED_CONFIRM", "--confirm", process.argv);
  const { url, host, bucket } = assertPreviewSeedAllowed(process.env);

  if (!r2Configured()) {
    throw new Error("Preview R2 credentials required for synthetic file fixtures");
  }

  console.log(
    JSON.stringify({
      target: "preview-synthetic",
      databaseHost: host,
      r2Bucket: bucket,
    }),
  );

  const pool = new pg.Pool({
    connectionString: url,
    ssl: pgSslForConnectionString(url),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const client = r2Client();

  try {
    await seedSiteContent(prisma);

    const adminEmail =
      process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
      "admin@kammerchor-elikuren.de";
    const adminPassword =
      process.env.SEED_ADMIN_PASSWORD || "Preview-Admin-Test-Password!";
    const admin = await upsertUser(prisma, {
      email: adminEmail,
      password: adminPassword,
      role: "vorstand",
      firstname: "Preview",
      lastname: "Admin",
      voice: "Bass",
    });

    await upsertUser(prisma, {
      email: "charles.heller@hotmail.de",
      password: process.env.SEED_CHARLES_PASSWORD || "Preview-Vorstand-Test!",
      role: "vorstand",
      firstname: "Charles",
      lastname: "Heller",
      voice: "Tenor",
    });

    await upsertUser(prisma, {
      email: "e2e-admin@kammerchor-elikuren.test",
      password: "E2E-Admin-Test-Password!",
      role: "vorstand",
      firstname: "E2E",
      lastname: "Admin",
      voice: "Bass",
    });
    await upsertUser(prisma, {
      email: "e2e-member@kammerchor-elikuren.test",
      password: "E2E-Member-Test-Password!",
      role: "mitglied",
      firstname: "E2E",
      lastname: "Mitglied",
      voice: "Sopran",
    });
    await upsertUser(prisma, {
      email: "e2e-kassenpruefer@kammerchor-elikuren.test",
      password: "E2E-Auditor-Test-Password!",
      role: "kassenpruefer",
      firstname: "E2E",
      lastname: "Kassenpruefer",
      voice: "Alt",
    });

    const synthMembers = [
      {
        email: "preview-sopran@kammerchor-elikuren.test",
        firstname: "Paula",
        lastname: "Preview",
        voice: "Sopran",
      },
      {
        email: "preview-alt@kammerchor-elikuren.test",
        firstname: "Anna",
        lastname: "Preview",
        voice: "Alt",
      },
      {
        email: "preview-bass@kammerchor-elikuren.test",
        firstname: "Ben",
        lastname: "Preview",
        voice: "Bass",
      },
    ] as const;
    for (const m of synthMembers) {
      await upsertUser(prisma, {
        ...m,
        password: "Preview-Member-Test-Password!",
        role: "mitglied",
      });
    }

    await prisma.membershipRequest.create({
      data: {
        email: "preview-pending@kammerchor-elikuren.test",
        firstname: "Pat",
        lastname: "Pending",
        voice: "Tenor",
        message: "Synthetische Preview-Mitgliedsanfrage",
        status: "pending",
      },
    });

    const heroFile = await createReadyFile(prisma, client, bucket, {
      category: "IMAGE",
      extension: "png",
      mimeType: "image/png",
      originalName: "preview-hero.png",
      body: TINY_PNG,
      publicWebsite: true,
      visibility: "PUBLIC",
    });
    const galleryFile = await createReadyFile(prisma, client, bucket, {
      category: "IMAGE",
      extension: "png",
      mimeType: "image/png",
      originalName: "preview-gallery.png",
      body: TINY_PNG,
      publicWebsite: true,
      visibility: "PUBLIC",
    });

    const hero = await prisma.mediaAsset.create({
      data: {
        title: "Preview Hero",
        altText: "Synthetisches Preview-Bild",
        storedFileId: heroFile.id,
        isActive: true,
        sortOrder: 0,
      },
    });
    await prisma.mediaAsset.create({
      data: {
        title: "Preview Galerie",
        altText: "Synthetisches Galeriebild",
        storedFileId: galleryFile.id,
        isActive: true,
        sortOrder: 1,
      },
    });

    const upcoming = await prisma.concert.create({
      data: {
        title: "Preview Frühjahrskonzert",
        slug: "preview-fruehjahrskonzert",
        startsAt: new Date("2026-05-16T17:00:00.000Z"),
        date: new Date("2026-05-16"),
        subtitle: "Nur Testdaten",
        description: "Synthetisches Preview-Konzert — keine echten Aufnahmen.",
        location: "Preview-Kirche",
        address: "Teststraße 1, 00000 Previewstadt",
        leader: "Preview Leitung",
        admissionInfo: "Nur Test",
        websiteStatus: "PUBLISHED",
        isVisible: true,
        isCurrent: true,
        heroImageId: hero.id,
      },
    });

    const past = await prisma.concert.create({
      data: {
        title: "Preview Herbstkonzert",
        slug: "preview-herbstkonzert",
        startsAt: new Date("2025-11-08T17:00:00.000Z"),
        date: new Date("2025-11-08"),
        subtitle: "Archiv-Testdaten",
        description: "Vergangenes synthetisches Konzert für Library-Tests.",
        location: "Preview-Saal",
        websiteStatus: "PUBLISHED",
        isVisible: true,
        isCurrent: false,
      },
    });

    await prisma.concert.create({
      data: {
        title: "Preview Entwurf",
        slug: "preview-entwurf",
        subtitle: "Draft",
        description: "Unveröffentlichtes synthetisches Konzert.",
        websiteStatus: "DRAFT",
        isVisible: false,
        isCurrent: false,
      },
    });

    const sheetA = await createReadyFile(prisma, client, bucket, {
      category: "SHEET",
      extension: "pdf",
      mimeType: "application/pdf",
      originalName: "preview-ave-maria.pdf",
      body: TINY_PDF,
    });
    const sheetB = await createReadyFile(prisma, client, bucket, {
      category: "SHEET",
      extension: "pdf",
      mimeType: "application/pdf",
      originalName: "preview-lullaby.pdf",
      body: TINY_PDF,
    });
    const practiceAudio = await createReadyFile(prisma, client, bucket, {
      category: "AUDIO",
      extension: "mp3",
      mimeType: "audio/mpeg",
      originalName: "preview-practice.mp3",
      body: TINY_AUDIO,
      audioKind: "practice",
    });
    const concertAudio = await createReadyFile(prisma, client, bucket, {
      category: "AUDIO",
      extension: "mp3",
      mimeType: "audio/mpeg",
      originalName: "preview-concert.mp3",
      body: TINY_AUDIO,
      audioKind: "concerts",
      concertId: past.id,
    });

    const sheetFile = await prisma.sheetFile.create({
      data: {
        title: "Preview Ave Maria",
        composer: "Testkomponist",
        storedFileId: sheetA.id,
        voiceGroup: "ELIKUREN",
        concertId: upcoming.id,
        isVisible: true,
      },
    });
    await prisma.sheetFile.create({
      data: {
        title: "Preview Lullaby",
        composer: "Demo",
        storedFileId: sheetB.id,
        voiceGroup: "SOPRANO",
        isVisible: true,
      },
    });

    const audioFile = await prisma.audioFile.create({
      data: {
        title: "Preview Übungsaufnahme",
        composer: "Testkomponist",
        storedFileId: practiceAudio.id,
        audioType: "REHEARSAL",
        voiceGroup: "SOPRANO",
        isVisible: true,
      },
    });
    await prisma.audioFile.create({
      data: {
        title: "Preview Konzertmitschnitt",
        composer: "Demo",
        storedFileId: concertAudio.id,
        audioType: "CONCERT_RECORDING",
        concertId: past.id,
        isVisible: true,
      },
    });

    await prisma.concertItem.createMany({
      data: [
        {
          concertId: upcoming.id,
          sortOrder: 0,
          title: "Preview Ave Maria",
          ensemble: "ELIKUREN",
          sheetFileId: sheetFile.id,
          audioFileId: audioFile.id,
        },
        {
          concertId: past.id,
          sortOrder: 0,
          title: "Preview Abschlusschor",
          ensemble: "ELIKUREN",
        },
      ],
    });

    const invoicePdf = await createReadyFile(prisma, client, bucket, {
      category: "INVOICE",
      extension: "pdf",
      mimeType: "application/pdf",
      originalName: "preview-beleg.pdf",
      body: TINY_PDF,
      visibility: "ADMIN",
    });

    await prisma.invoice.createMany({
      data: [
        {
          invoiceNumber: `PREVIEW-OPEN-${Date.now()}`,
          documentType: "INVOICE",
          recipientName: "Preview Lieferant GmbH",
          amountCents: 4590,
          issueDate: new Date("2026-03-01"),
          status: "OPEN",
          note: "Synthetischer offener Beleg",
          storedFileId: invoicePdf.id,
          createdById: admin.id,
        },
        {
          invoiceNumber: `PREVIEW-PAID-${Date.now()}`,
          documentType: "RECEIPT",
          recipientName: "Preview Bürobedarf",
          amountCents: 1299,
          issueDate: new Date("2026-02-10"),
          paidAt: new Date("2026-02-12"),
          paymentMethod: "Überweisung",
          status: "PAID",
          note: "Synthetischer bezahlter Beleg",
          createdById: admin.id,
        },
      ],
    });

    const summary = {
      users: await prisma.user.count(),
      concerts: await prisma.concert.count(),
      sheets: await prisma.sheetFile.count(),
      audios: await prisma.audioFile.count(),
      media: await prisma.mediaAsset.count(),
      files: await prisma.storedFile.count(),
      invoices: await prisma.invoice.count(),
      membershipRequests: await prisma.membershipRequest.count(),
    };

    console.log("Preview synthetic seed complete");
    console.log(JSON.stringify(summary, null, 2));
    console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
    console.log("Charles: charles.heller@hotmail.de (vorstand, Magic Link or SEED_CHARLES_PASSWORD)");
    console.log("Members: preview-*@kammerchor-elikuren.test / Preview-Member-Test-Password!");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
