/**
 * Import editorial /public images into MediaAsset (R2) and wire CMS mediaRefs.
 *
 * Identity is the stable object key: public/cms-static/{sourceKey}.{ext}
 * Never hardcodes MediaAsset database IDs.
 *
 * Usage (from app/):
 *   npx tsx scripts/migrate-cms-static-media.ts           # dry-run
 *   npx tsx scripts/migrate-cms-static-media.ts --apply   # upload + patch
 *
 * Idempotent: re-running skips existing object keys and does not overwrite
 * non-null CMS mediaRefs (admin-selected assets stay).
 */
import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";
import {
  CMS_STATIC_MEDIA,
  cmsStaticObjectKey,
  mimeForPublicFile,
  type CmsStaticMediaSlot,
} from "../lib/site-content/cms-static-media";
import { pgSslForConnectionString } from "../lib/pg-connection";
import { r2Configured, r2Endpoint } from "../lib/r2";
import { loadTargetEnv } from "./load-target-env";

const target = loadTargetEnv();

const APP_ROOT = process.cwd();
const PUBLIC_DIR = path.join(APP_ROOT, "public");

type MediaRef = {
  mediaAssetId: string;
  isDecorative: boolean;
  altText: string;
};

function parseArgs(argv: string[]) {
  return {
    apply: argv.includes("--apply"),
    confirmProduction: argv.includes("--confirm-production"),
  };
}

function isEmptyMediaRef(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "object") return true;
  const id = (value as { mediaAssetId?: unknown }).mediaAssetId;
  return typeof id !== "string" || !id.trim();
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function applySlot(
  data: Record<string, unknown>,
  slot: CmsStaticMediaSlot,
  ref: MediaRef,
): boolean {
  if (slot.kind === "sectionField") {
    if (!isEmptyMediaRef(data[slot.field])) return false;
    data[slot.field] = ref;
    return true;
  }

  if (slot.kind === "listItemField") {
    const list = asArray(data[slot.listField]);
    if (!list) return false;
    const item = list.find((row) => asObject(row)?.id === slot.itemId);
    const obj = asObject(item);
    if (!obj) return false;
    if (!isEmptyMediaRef(obj[slot.field])) return false;
    obj[slot.field] = ref;
    return true;
  }

  const outer = asArray(data[slot.outerListField]);
  if (!outer) return false;
  const outerItem = outer.find((row) => asObject(row)?.id === slot.outerItemId);
  const outerObj = asObject(outerItem);
  if (!outerObj) return false;
  const inner = asArray(outerObj[slot.innerListField]);
  if (!inner) return false;
  const innerItem = inner.find((row) => asObject(row)?.id === slot.innerItemId);
  const innerObj = asObject(innerItem);
  if (!innerObj) return false;
  if (!isEmptyMediaRef(innerObj[slot.field])) return false;
  innerObj[slot.field] = ref;
  return true;
}

async function main() {
  const { apply, confirmProduction } = parseArgs(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  if (apply && target === "production" && !confirmProduction) {
    throw new Error(
      "Refusing production --apply without --confirm-production (and TARGET_ENV=production guards)",
    );
  }

  if (apply && !r2Configured()) {
    throw new Error("R2 credentials required for --apply");
  }

  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      target,
      databaseHost: (() => {
        try {
          return new URL(databaseUrl).hostname;
        } catch {
          return "(unparsed)";
        }
      })(),
    }),
  );

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: pgSslForConnectionString(databaseUrl),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const s3 =
    apply && r2Configured()
      ? new S3Client({
          region: "auto",
          endpoint: r2Endpoint(),
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          },
          forcePathStyle: true,
        })
      : null;
  const bucket = process.env.R2_BUCKET_NAME!;

  let uploaded = 0;
  let reused = 0;
  let patchedSlots = 0;
  let skippedSlots = 0;

  try {
    const assetBySourceKey = new Map<string, string>();

    for (const def of CMS_STATIC_MEDIA) {
      const objectKey = cmsStaticObjectKey(def);
      const localPath = path.join(PUBLIC_DIR, def.publicFile);
      const body = await fs.readFile(localPath);
      const mimeType = mimeForPublicFile(def.publicFile);
      const checksum = createHash("sha256").update(body).digest("hex");

      const existing = await prisma.storedFile.findUnique({
        where: { objectKey },
        include: { mediaAssets: { where: { isArchived: false }, take: 1 } },
      });

      let mediaAssetId = existing?.mediaAssets[0]?.id ?? null;

      if (mediaAssetId) {
        reused += 1;
        console.log(`[reuse] ${def.sourceKey} → ${mediaAssetId}`);
      } else if (!apply) {
        console.log(`[dry-run] would import ${def.sourceKey} (${def.publicFile})`);
      } else {
        const fileId = existing?.id ?? randomUUID();
        if (!existing) {
          if (!s3) throw new Error("S3 client missing");
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: objectKey,
              Body: body,
              ContentType: mimeType,
              ContentLength: body.length,
            }),
          );
          await prisma.storedFile.create({
            data: {
              id: fileId,
              objectKey,
              originalName: def.publicFile,
              mimeType,
              sizeBytes: body.length,
              checksum,
              category: "IMAGE",
              visibility: "PUBLIC",
              uploadStatus: "READY",
            },
          });
        } else if (existing.uploadStatus !== "READY") {
          await prisma.storedFile.update({
            where: { id: existing.id },
            data: { uploadStatus: "READY", checksum, sizeBytes: body.length },
          });
        }

        const asset = await prisma.mediaAsset.create({
          data: {
            title: def.title,
            altText: "",
            isDecorative: false,
            storedFileId: fileId,
            isActive: true,
            isArchived: false,
          },
        });
        mediaAssetId = asset.id;
        uploaded += 1;
        console.log(`[upload] ${def.sourceKey} → ${mediaAssetId}`);
      }

      if (mediaAssetId) {
        assetBySourceKey.set(def.sourceKey, mediaAssetId);
      }
    }

    // Group slots by page/section for fewer writes.
    type Pending = {
      pageKey: string;
      sectionKey: string;
      slots: Array<{ slot: CmsStaticMediaSlot; ref: MediaRef }>;
    };
    const pending = new Map<string, Pending>();

    for (const def of CMS_STATIC_MEDIA) {
      const mediaAssetId = assetBySourceKey.get(def.sourceKey);
      if (!mediaAssetId) continue;
      for (const slot of def.slots) {
        const key = `${slot.pageKey}/${slot.sectionKey}`;
        const ref: MediaRef = {
          mediaAssetId,
          isDecorative: Boolean(slot.isDecorative),
          altText: slot.altText,
        };
        const group = pending.get(key) ?? {
          pageKey: slot.pageKey,
          sectionKey: slot.sectionKey,
          slots: [],
        };
        group.slots.push({ slot, ref });
        pending.set(key, group);
      }
    }

    for (const group of pending.values()) {
      const page = await prisma.sitePage.findUnique({
        where: { key: group.pageKey },
        include: {
          sections: { where: { key: group.sectionKey } },
        },
      });
      const section = page?.sections[0];
      if (!section) {
        console.warn(
          `[skip] missing section ${group.pageKey}/${group.sectionKey}`,
        );
        skippedSlots += group.slots.length;
        continue;
      }

      const data = structuredClone(section.data) as Record<string, unknown>;
      let changed = false;
      for (const { slot, ref } of group.slots) {
        if (applySlot(data, slot, ref)) {
          patchedSlots += 1;
          changed = true;
        } else {
          skippedSlots += 1;
        }
      }

      if (!changed) continue;
      if (!apply) {
        console.log(
          `[dry-run] would patch ${group.pageKey}/${group.sectionKey}`,
        );
        continue;
      }

      await prisma.siteSection.update({
        where: { id: section.id },
        data: {
          data: data as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
      });
      await prisma.sitePage.update({
        where: { id: page!.id },
        data: { updatedAt: new Date() },
      });
      console.log(`[patch] ${group.pageKey}/${group.sectionKey}`);
    }

    console.log(
      JSON.stringify(
        {
          apply,
          uploaded,
          reused,
          patchedSlots,
          skippedSlots,
          catalogSize: CMS_STATIC_MEDIA.length,
        },
        null,
        2,
      ),
    );
    if (apply && patchedSlots > 0) {
      console.log(
        "Note: restart the Next.js server (or re-save affected CMS pages) so tagged data caches pick up new mediaRefs.",
      );
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
