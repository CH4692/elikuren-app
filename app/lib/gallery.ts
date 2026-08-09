import { prisma } from "@/lib/db";
import {
  assertMediaAltValid,
  isPublicObjectKey,
  publicObjectUrl,
} from "@/lib/public-media";

export type MediaAssetRow = {
  id: string;
  title: string;
  altText: string;
  isDecorative: boolean;
  caption: string | null;
  takenAt: Date | null;
  isActive: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  storedFileId: string;
  storedFile: {
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    uploadStatus: string;
    objectKey: string;
    visibility: string;
  };
  _count?: { concertHeros: number };
};

export function serializeMediaAsset(image: MediaAssetRow) {
  const publicUrl =
    image.storedFile.visibility === "PUBLIC"
      ? publicObjectUrl(image.storedFile.objectKey)
      : null;

  return {
    id: image.id,
    title: image.title,
    alt_text: image.altText,
    is_decorative: image.isDecorative,
    caption: image.caption,
    taken_at: image.takenAt ? image.takenAt.toISOString().slice(0, 10) : null,
    is_active: image.isActive,
    is_archived: image.isArchived,
    sort_order: image.sortOrder,
    reference_count: image._count?.concertHeros ?? 0,
    public_url: publicUrl,
    stored_file: {
      id: image.storedFile.id,
      original_name: image.storedFile.originalName,
      mime_type: image.storedFile.mimeType,
      size_bytes: image.storedFile.sizeBytes,
      upload_status: image.storedFile.uploadStatus,
      visibility: image.storedFile.visibility,
      object_key: image.storedFile.objectKey,
    },
    created_at: image.createdAt.toISOString(),
    updated_at: image.updatedAt.toISOString(),
  };
}

/** @deprecated Use serializeMediaAsset */
export const serializeGalleryImage = serializeMediaAsset;

const includeStored = {
  storedFile: {
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      uploadStatus: true,
      objectKey: true,
      visibility: true,
    },
  },
  _count: { select: { concertHeros: true } },
} as const;

export async function listMediaAssetsAdmin(q?: string) {
  return prisma.mediaAsset.findMany({
    where: {
      storedFile: { deletedAt: null },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { caption: { contains: q, mode: "insensitive" } },
              { altText: { contains: q, mode: "insensitive" } },
              {
                storedFile: {
                  originalName: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: includeStored,
    orderBy: [{ sortOrder: "asc" }, { takenAt: "desc" }, { createdAt: "desc" }],
    take: 2000,
  });
}

/** @deprecated Use listMediaAssetsAdmin */
export const listGalleryImagesAdmin = listMediaAssetsAdmin;

export async function createMediaAsset(input: {
  storedFileId: string;
  title: string;
  altText?: string;
  isDecorative?: boolean;
  caption?: string | null;
  takenAt?: string | null;
  sortOrder?: number;
}) {
  const stored = await prisma.storedFile.findUnique({
    where: { id: input.storedFileId },
  });
  if (
    !stored ||
    stored.deletedAt ||
    stored.uploadStatus !== "READY" ||
    stored.category !== "IMAGE"
  ) {
    throw new Error("Datei nicht bereit");
  }

  const title = input.title.trim();
  if (!title) throw new Error("Titel ist Pflicht");

  const isDecorative = Boolean(input.isDecorative);
  const altText = isDecorative ? "" : String(input.altText ?? "").trim();
  assertMediaAltValid({ isDecorative, altText });

  if (!isPublicObjectKey(stored.objectKey)) {
    throw new Error(
      "Website-Medien müssen unter dem R2-Prefix public/ liegen (neuen Upload verwenden)",
    );
  }

  return prisma.$transaction(async (tx) => {
    if (stored.visibility !== "PUBLIC") {
      await tx.storedFile.update({
        where: { id: stored.id },
        data: { visibility: "PUBLIC" },
      });
    }

    return tx.mediaAsset.create({
      data: {
        title,
        altText,
        isDecorative,
        caption: input.caption?.trim() || null,
        takenAt: input.takenAt
          ? new Date(`${input.takenAt}T00:00:00.000Z`)
          : null,
        storedFileId: stored.id,
        isActive: true,
        isArchived: false,
        sortOrder: input.sortOrder ?? 0,
      },
      include: includeStored,
    });
  });
}

/** @deprecated Use createMediaAsset */
export const createGalleryImage = createMediaAsset;

export async function updateMediaAsset(
  id: string,
  input: {
    title?: string;
    altText?: string;
    isDecorative?: boolean;
    caption?: string | null;
    takenAt?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    isArchived?: boolean;
  },
) {
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) throw new Error("Bild nicht gefunden");

  const title =
    input.title !== undefined ? String(input.title).trim() : existing.title;
  if (!title) throw new Error("Titel ist Pflicht");

  const isDecorative =
    input.isDecorative !== undefined
      ? Boolean(input.isDecorative)
      : existing.isDecorative;
  const altText = isDecorative
    ? ""
    : input.altText !== undefined
      ? String(input.altText).trim()
      : existing.altText;
  assertMediaAltValid({ isDecorative, altText });

  return prisma.mediaAsset.update({
    where: { id },
    data: {
      title,
      altText,
      isDecorative,
      ...(input.caption !== undefined
        ? { caption: input.caption?.trim() || null }
        : {}),
      ...(input.takenAt !== undefined
        ? {
            takenAt: input.takenAt
              ? new Date(`${input.takenAt}T00:00:00.000Z`)
              : null,
          }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isArchived !== undefined
        ? { isArchived: input.isArchived }
        : {}),
    },
    include: includeStored,
  });
}

/**
 * Hard-delete blocked while referenced. Prefer archive.
 * Returns `{ archived: true }` when references exist.
 */
export async function deleteOrArchiveMediaAsset(id: string) {
  const existing = await prisma.mediaAsset.findUnique({
    where: { id },
    include: {
      _count: { select: { concertHeros: true } },
    },
  });
  if (!existing) throw new Error("Bild nicht gefunden");

  if (existing._count.concertHeros > 0) {
    const archived = await prisma.mediaAsset.update({
      where: { id },
      data: { isArchived: true, isActive: false },
      include: includeStored,
    });
    return { archived: true as const, image: archived };
  }

  await prisma.$transaction(async (tx) => {
    await tx.mediaAsset.delete({ where: { id } });
    await tx.storedFile.update({
      where: { id: existing.storedFileId },
      data: { deletedAt: new Date(), uploadStatus: "DELETED" },
    });
  });

  return { archived: false as const, deleted: true as const };
}
