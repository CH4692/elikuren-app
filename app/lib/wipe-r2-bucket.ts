import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
  type ObjectIdentifier,
} from "@aws-sdk/client-s3";

import { r2Configured, r2Endpoint } from "@/lib/r2";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
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

/** Delete every object in the configured R2 bucket. Returns deleted object count. */
export async function wipeR2Bucket(
  env: Record<string, string | undefined> = process.env,
): Promise<{ bucket: string; deleted: number }> {
  if (!r2Configured()) {
    throw new Error(
      "R2 is not configured (need R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT or R2_ACCOUNT_ID)",
    );
  }

  const bucket = requireEnv("R2_BUCKET_NAME");
  const allowed = env.R2_PREVIEW_BUCKET_NAME?.trim();
  if (allowed && allowed !== bucket) {
    throw new Error(
      `Refusing R2 wipe: bucket "${bucket}" does not match R2_PREVIEW_BUCKET_NAME="${allowed}"`,
    );
  }

  const client = getClient();
  let deleted = 0;
  let continuationToken: string | undefined;

  do {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    const objects = (listed.Contents ?? [])
      .map((obj) => obj.Key)
      .filter((key): key is string => Boolean(key))
      .map((Key): ObjectIdentifier => ({ Key }));

    if (objects.length > 0) {
      const result = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects, Quiet: true },
        }),
      );
      deleted += objects.length - (result.Errors?.length ?? 0);
      if (result.Errors?.length) {
        throw new Error(
          `R2 delete failed for ${result.Errors.length} object(s): ${result.Errors[0]?.Message}`,
        );
      }
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return { bucket, deleted };
}
