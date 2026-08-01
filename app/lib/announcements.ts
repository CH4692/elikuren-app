import type {
  Announcement,
  AnnouncementAudience,
  Prisma,
  Role,
  VoiceGroup,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { normalizeVoiceLabel } from "@/lib/files";

type AnnouncementWithRelations = Announcement & {
  targets?: {
    id: string;
    audience: AnnouncementAudience;
    role: Role | null;
    voiceGroup: VoiceGroup | null;
  }[];
  reads?: { userId: string; readAt: Date }[];
  _count?: { reads: number };
};

export function serializeAnnouncement(
  item: AnnouncementWithRelations,
  userId?: string,
) {
  const read = userId
    ? item.reads?.find((r) => r.userId === userId)
    : undefined;

  return {
    id: item.id,
    title: item.title,
    body: item.body,
    is_important: item.isImportant,
    published_at: item.publishedAt?.toISOString() ?? null,
    expires_at: item.expiresAt?.toISOString() ?? null,
    targets: (item.targets ?? []).map((t) => ({
      audience: t.audience,
      role: t.role,
      voice_group: t.voiceGroup,
    })),
    read_count: item._count?.reads ?? item.reads?.length ?? 0,
    is_read: read ? true : false,
    read_at: read?.readAt.toISOString() ?? null,
    created_at: item.createdAt.toISOString(),
    updated_at: item.updatedAt.toISOString(),
  };
}

function audienceMatchesUser(
  targets: AnnouncementWithRelations["targets"],
  user: { role: Role; voice: string | null },
): boolean {
  if (!targets?.length) return true;
  for (const t of targets) {
    if (t.audience === "ALL_MEMBERS") return true;
    if (t.audience === "ROLE" && t.role === user.role) return true;
    if (
      t.audience === "VOICE_GROUP" &&
      t.voiceGroup &&
      normalizeVoiceLabel(user.voice) === t.voiceGroup
    ) {
      return true;
    }
  }
  return false;
}

export async function listPublishedForUser(user: {
  id: string;
  role: Role;
  voice: string | null;
}) {
  const now = new Date();
  const items = await prisma.announcement.findMany({
    where: {
      publishedAt: { not: null, lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publishedAt: "desc" },
    include: {
      targets: true,
      reads: { where: { userId: user.id } },
    },
  });

  return items.filter((item) =>
    audienceMatchesUser(item.targets, user),
  );
}

export async function listAnnouncementsAdmin() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      targets: true,
      _count: { select: { reads: true } },
    },
  });
}

export async function getAnnouncementById(id: string, userId?: string) {
  return prisma.announcement.findUnique({
    where: { id },
    include: {
      targets: true,
      reads: userId ? { where: { userId } } : undefined,
      _count: { select: { reads: true } },
    },
  });
}

export type AnnouncementTargetInput = {
  audience: AnnouncementAudience;
  role?: Role | null;
  voiceGroup?: VoiceGroup | null;
};

export type AnnouncementCreateInput = {
  title: string;
  body: string;
  isImportant?: boolean;
  expiresAt?: string | null;
  targets?: AnnouncementTargetInput[];
  publish?: boolean;
};

export async function createAnnouncement(data: AnnouncementCreateInput) {
  const targets = data.targets?.length
    ? data.targets
    : [{ audience: "ALL_MEMBERS" as const }];

  return prisma.announcement.create({
    data: {
      title: data.title.trim(),
      body: data.body.trim(),
      isImportant: data.isImportant ?? false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      publishedAt: data.publish ? new Date() : null,
      targets: {
        create: targets.map((t) => ({
          audience: t.audience,
          role: t.audience === "ROLE" ? t.role ?? null : null,
          voiceGroup:
            t.audience === "VOICE_GROUP" ? t.voiceGroup ?? null : null,
        })),
      },
    },
    include: { targets: true, _count: { select: { reads: true } } },
  });
}

export async function updateAnnouncement(
  id: string,
  data: Partial<AnnouncementCreateInput> & { publish?: boolean; unpublish?: boolean },
) {
  const patch: Prisma.AnnouncementUpdateInput = {};
  if ("title" in data && data.title != null) patch.title = data.title.trim();
  if ("body" in data && data.body != null) patch.body = data.body.trim();
  if ("isImportant" in data) patch.isImportant = data.isImportant ?? false;
  if ("expiresAt" in data)
    patch.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.publish) patch.publishedAt = new Date();
  if (data.unpublish) patch.publishedAt = null;

  if (data.targets) {
    await prisma.announcementTarget.deleteMany({ where: { announcementId: id } });
    patch.targets = {
      create: data.targets.map((t) => ({
        audience: t.audience,
        role: t.audience === "ROLE" ? t.role ?? null : null,
        voiceGroup:
          t.audience === "VOICE_GROUP" ? t.voiceGroup ?? null : null,
      })),
    };
  }

  return prisma.announcement.update({
    where: { id },
    data: patch,
    include: { targets: true, _count: { select: { reads: true } } },
  });
}

export async function deleteAnnouncement(id: string) {
  await prisma.announcement.delete({ where: { id } });
}

export async function markAnnouncementRead(announcementId: string, userId: string) {
  return prisma.announcementRead.upsert({
    where: {
      announcementId_userId: { announcementId, userId },
    },
    create: { announcementId, userId },
    update: {},
  });
}
