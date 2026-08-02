import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

/** Prefer R2_ENDPOINT; otherwise derive from R2_ACCOUNT_ID. */
export function r2Endpoint(): string {
  const explicit = process.env.R2_ENDPOINT?.trim();
  if (explicit) return explicit;
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  if (accountId) return `https://${accountId}.r2.cloudflarestorage.com`;
  throw new Error("R2_ENDPOINT is not configured");
}

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      (process.env.R2_ENDPOINT || process.env.R2_ACCOUNT_ID),
  );
}

function getClient(): S3Client {
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

function bucket(): string {
  return requireEnv("R2_BUCKET_NAME");
}

export function signedUrlTtlSeconds(): number {
  const raw = Number(process.env.R2_SIGNED_URL_TTL_SECONDS ?? "300");
  if (!Number.isFinite(raw) || raw < 30) return 300;
  return Math.min(raw, 3600);
}

export async function createPresignedPutUrl(input: {
  objectKey: string;
  contentType: string;
  contentLength: number;
}): Promise<{ url: string; expiresIn: number }> {
  const expiresIn = signedUrlTtlSeconds();
  const url = await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: input.objectKey,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
    }),
    { expiresIn },
  );
  return { url, expiresIn };
}

export async function createPresignedGetUrl(input: {
  objectKey: string;
  fileName: string;
  contentType: string;
  disposition: "inline" | "attachment";
}): Promise<{ url: string; expiresIn: number }> {
  const expiresIn = signedUrlTtlSeconds();
  const url = await getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: input.objectKey,
      ResponseContentType: input.contentType,
      ResponseContentDisposition: `${input.disposition}; filename="${input.fileName.replace(/"/g, "")}"`,
    }),
    { expiresIn },
  );
  return { url, expiresIn };
}

export async function headObject(objectKey: string) {
  return getClient().send(
    new HeadObjectCommand({
      Bucket: bucket(),
      Key: objectKey,
    }),
  );
}

export async function deleteObject(objectKey: string) {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket(),
      Key: objectKey,
    }),
  );
}

export function buildObjectKey(parts: string[]): string {
  return parts
    .map((part) =>
      part
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join("/");
}
