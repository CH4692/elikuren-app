/**
 * Decide how an authenticated `/api/files/[id]/url` response should deliver bytes.
 *
 * PUBLIC website assets can use a durable CDN URL without R2 API tokens.
 * MEMBERS/ADMIN (private) objects always require a working R2 API config for signing.
 */

import { publicObjectUrl } from "@/lib/public-media";

export type FileDeliveryPlan =
  | { kind: "public"; url: string; expiresIn: null }
  | { kind: "signed" }
  | { kind: "unavailable"; code: "r2_unconfigured" };

export function planFileDelivery(input: {
  visibility: string;
  objectKey: string;
  apiConfigured: boolean;
  publicUrl?: string | null;
}): FileDeliveryPlan {
  const publicUrl =
    input.publicUrl !== undefined
      ? input.publicUrl
      : publicObjectUrl(input.objectKey);

  if (input.visibility === "PUBLIC" && publicUrl) {
    return { kind: "public", url: publicUrl, expiresIn: null };
  }

  if (!input.apiConfigured) {
    return { kind: "unavailable", code: "r2_unconfigured" };
  }

  return { kind: "signed" };
}
