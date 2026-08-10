import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

import { SITE_PAGE_DEFS } from "@/lib/site-content/defaults";
import { parseSectionData } from "@/lib/site-content/schemas";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Map legacy home section JSON (pre Phase-1 schemas) into the new shape
 * without inventing new editorial copy when old fields exist.
 */
function migrateLegacySectionData(
  pageKey: string,
  sectionKey: string,
  data: unknown,
): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const row = data as Record<string, unknown>;

  if (pageKey === "home" && sectionKey === "landing") {
    if (typeof row.title === "string" && row.title.trim()) return row;
    const eyebrow = typeof row.eyebrow === "string" ? row.eyebrow.trim() : "";
    const headline = typeof row.headline === "string" ? row.headline.trim() : "";
    const title =
      [eyebrow, headline].filter(Boolean).join(" ") || "Kammerchor Elikuren";
    return {
      title,
      tagline:
        typeof row.subline === "string" && row.subline.trim()
          ? row.subline
          : "Musik, die verbindet. Stimmen, die berühren.",
      ctaLabel:
        typeof row.ctaLabel === "string" && row.ctaLabel.trim()
          ? row.ctaLabel
          : "Konzerte entdecken",
      ctaHref:
        typeof row.ctaHref === "string" && row.ctaHref.trim()
          ? row.ctaHref.startsWith("#")
            ? `/home${row.ctaHref}`
            : row.ctaHref
          : "/home#concerts",
      heroImage: null,
    };
  }

  if (pageKey === "home" && sectionKey === "chorleitung") {
    if (typeof row.ctaLabel === "string" && typeof row.ctaHref === "string") {
      return row;
    }
    const defBody = SITE_PAGE_DEFS.find((p) => p.key === "home")?.sections.find(
      (s) => s.key === "chorleitung",
    )?.defaults.body;
    return {
      eyebrow: typeof row.eyebrow === "string" ? row.eyebrow : "Chorleitung",
      name: typeof row.name === "string" ? row.name : "Christiane Kampe",
      body:
        typeof row.body === "string" && row.body.trim()
          ? row.body
          : typeof defBody === "string"
            ? defBody
            : "Chorleitung",
      ctaLabel: "Mehr erfahren",
      ctaHref: "/chorleitung",
      portrait: null,
    };
  }

  if (pageKey === "home" && sectionKey === "ensembles") {
    if (Array.isArray(row.cards)) return row;
    const def = SITE_PAGE_DEFS.find((p) => p.key === "home")?.sections.find(
      (s) => s.key === "ensembles",
    )?.defaults;
    return {
      headline:
        typeof row.headline === "string" && row.headline.trim()
          ? row.headline
          : "Unsere Ensembles",
      cards: def && Array.isArray(def.cards) ? def.cards : [],
    };
  }

  if (pageKey === "home" && sectionKey === "support") {
    if (Array.isArray(row.sponsors)) return row;
    const def = SITE_PAGE_DEFS.find((p) => p.key === "home")?.sections.find(
      (s) => s.key === "support",
    )?.defaults;
    return {
      headline: typeof row.headline === "string" ? row.headline : "",
      sponsors: def && Array.isArray(def.sponsors) ? def.sponsors : [],
    };
  }

  return data;
}

/**
 * Idempotent: creates missing pages/sections; never overwrites non-empty
 * editorial data. May rewrite a section once when a legacy shape can be
 * migrated into a valid new schema (existing field values preserved).
 */
export async function seedSiteContent(prisma: Db) {
  for (const def of SITE_PAGE_DEFS) {
    const page = await prisma.sitePage.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        title: def.title,
        description: def.description,
      },
      update: {},
    });

    // Fill admin description only when missing (additive).
    if (!page.description && def.description) {
      await prisma.sitePage.update({
        where: { id: page.id },
        data: { description: def.description },
      });
    }

    for (const section of def.sections) {
      const existing = await prisma.siteSection.findUnique({
        where: {
          pageId_key: { pageId: page.id, key: section.key },
        },
      });

      if (!existing) {
        await prisma.siteSection.create({
          data: {
            pageId: page.id,
            key: section.key,
            isVisible: true,
            data: section.defaults as Prisma.InputJsonValue,
          },
        });
        continue;
      }

      const parsed = parseSectionData(def.key, section.key, existing.data);
      if (parsed.ok) continue;

      const migrated = migrateLegacySectionData(
        def.key,
        section.key,
        existing.data,
      );
      const migratedParsed = parseSectionData(def.key, section.key, migrated);
      if (!migratedParsed.ok) {
        // Leave row untouched; admin will see invalid until edited.
        continue;
      }

      await prisma.siteSection.update({
        where: { id: existing.id },
        data: {
          data: migratedParsed.data as Prisma.InputJsonValue,
        },
      });
    }
  }
}
