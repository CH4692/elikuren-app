import { prisma } from "@/lib/db";

export function serializeGalleryImage(image: {
  id: string;
  title: string;
  caption: string | null;
  takenAt: Date | null;
  isVisible: boolean;
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
  };
}) {
  return {
    id: image.id,
    title: image.title,
    caption: image.caption,
    taken_at: image.takenAt ? image.takenAt.toISOString().slice(0, 10) : null,
    is_visible: image.isVisible,
    sort_order: image.sortOrder,
    stored_file: {
      id: image.storedFile.id,
      original_name: image.storedFile.originalName,
      mime_type: image.storedFile.mimeType,
      size_bytes: image.storedFile.sizeBytes,
      upload_status: image.storedFile.uploadStatus,
    },
    created_at: image.createdAt.toISOString(),
    updated_at: image.updatedAt.toISOString(),
  };
}

const includeStored = {
  storedFile: {
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      uploadStatus: true,
    },
  },
} as const;

export async function listGalleryImagesAdmin(q?: string) {
  return prisma.galleryImage.findMany({
    where: {
      storedFile: { deletedAt: null },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { caption: { contains: q, mode: "insensitive" } },
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

export async function createGalleryImage(input: {
  storedFileId: string;
  title: string;
  caption?: string | null;
  takenAt?: string | null;
  isVisible?: boolean;
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

  return prisma.galleryImage.create({
    data: {
      title,
      caption: input.caption?.trim() || null,
      takenAt: input.takenAt
        ? new Date(`${input.takenAt}T00:00:00.000Z`)
        : null,
      storedFileId: stored.id,
      isVisible: input.isVisible !== false,
      sortOrder: input.sortOrder ?? 0,
    },
    include: includeStored,
  });
}
