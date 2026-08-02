import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { SITE_PAGE_DEFS } from "@/lib/site-content/schemas";

type Db = PrismaClient | Prisma.TransactionClient;

/** Idempotent: creates missing pages/sections; never overwrites editorial data. */
export async function seedSiteContent(prisma: Db) {
  for (const def of SITE_PAGE_DEFS) {
    const page = await prisma.sitePage.upsert({
      where: { key: def.key },
      create: { key: def.key, title: def.title },
      update: {},
    });

    for (const section of def.sections) {
      const existing = await prisma.siteSection.findUnique({
        where: {
          pageId_key: { pageId: page.id, key: section.key },
        },
      });
      if (existing) continue;
      await prisma.siteSection.create({
        data: {
          pageId: page.id,
          key: section.key,
          isVisible: true,
          data: section.defaults as Prisma.InputJsonValue,
        },
      });
    }
  }
}
