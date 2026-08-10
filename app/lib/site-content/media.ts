import { prisma } from "@/lib/db";
import { publicObjectUrl, resolveMediaAlt } from "@/lib/public-media";

export type CmsMediaRef = {
  mediaAssetId: string;
  isDecorative: boolean;
  altText: string;
} | null;

export type ResolvedCmsMedia = {
  src: string;
  alt: string;
  isDecorative: boolean;
};

function asMediaRef(value: unknown): CmsMediaRef {
  if (!value || typeof value !== "object") return null;
  const v = value as {
    mediaAssetId?: unknown;
    isDecorative?: unknown;
    altText?: unknown;
  };
  if (typeof v.mediaAssetId !== "string" || !v.mediaAssetId) return null;
  return {
    mediaAssetId: v.mediaAssetId,
    isDecorative: Boolean(v.isDecorative),
    altText: typeof v.altText === "string" ? v.altText : "",
  };
}

/**
 * Resolve one or many CMS mediaRefs in a single DB round-trip.
 * Usage alt from mediaRef wins; catalog alt is never used for public render.
 * Missing/deleted assets omit the image (no /public editorial fallback).
 */
export async function resolveCmsMedia(
  ref: unknown,
): Promise<ResolvedCmsMedia | null> {
  const results = await resolveCmsMediaMany([ref]);
  return results[0] ?? null;
}

export async function resolveCmsMediaMany(
  items: unknown[],
): Promise<Array<ResolvedCmsMedia | null>> {
  const refs = items.map((item) => asMediaRef(item));
  const ids = [
    ...new Set(
      refs
        .map((ref) => ref?.mediaAssetId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const assets =
    ids.length === 0
      ? []
      : await prisma.mediaAsset.findMany({
          where: { id: { in: ids }, isArchived: false, isActive: true },
          include: {
            storedFile: {
              select: { objectKey: true, visibility: true },
            },
          },
        });

  const byId = new Map(assets.map((asset) => [asset.id, asset]));

  return refs.map((ref) => {
    if (!ref) return null;
    const asset = byId.get(ref.mediaAssetId);
    const url = asset?.storedFile
      ? publicObjectUrl(asset.storedFile.objectKey)
      : null;
    if (url) {
      return {
        src: url,
        alt: resolveMediaAlt({
          isDecorative: ref.isDecorative,
          altText: ref.altText,
        }),
        isDecorative: ref.isDecorative,
      };
    }
    console.warn(
      `[site-content] media asset missing or not public: ${ref.mediaAssetId}`,
    );
    return null;
  });
}
