import { z } from "zod";

import { siteLinkZod, validateSiteLink } from "@/lib/site-content/links";

const nonEmpty = z.string().trim().min(1);
const optionalText = z.string();

/** Usage-specific media reference (alt belongs here, not on MediaAsset). */
export const mediaRefSchema = z
  .object({
    mediaAssetId: z.string().min(1),
    isDecorative: z.boolean().default(false),
    altText: z.string().default(""),
  })
  .superRefine((value, ctx) => {
    if (!value.isDecorative && !value.altText.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "altText ist Pflicht für inhaltliche Bilder",
        path: ["altText"],
      });
    }
  });

export const optionalMediaRefSchema = mediaRefSchema.nullable();

const stableId = z.string().min(1);

const linkField = siteLinkZod();

/** Empty string or a validated site link. */
const optionalHrefField = z.string().superRefine((value, ctx) => {
  if (!value.trim()) return;
  const result = validateSiteLink(value);
  if (!result.ok) {
    ctx.addIssue({ code: "custom", message: result.error });
  }
});

const navChildSchema = z.object({
  id: stableId,
  label: nonEmpty,
  href: linkField,
  visible: z.boolean(),
  sortOrder: z.number().int(),
});

const navItemSchema = z
  .object({
    id: stableId,
    label: nonEmpty,
    href: linkField.optional(),
    visible: z.boolean(),
    sortOrder: z.number().int(),
    children: z.array(navChildSchema).optional(),
  })
  .superRefine((value, ctx) => {
    const hasChildren = (value.children?.length ?? 0) > 0;
    if (!hasChildren && !value.href) {
      ctx.addIssue({
        code: "custom",
        message: "Nav-Eintrag braucht href oder Unterpunkte",
        path: ["href"],
      });
    }
  });

// --- global ---

export const globalOrganizationSchema = z.object({
  choirName: nonEmpty,
  legalName: nonEmpty,
  email: nonEmpty.email(),
  phone: optionalText,
  street: nonEmpty,
  postalCode: nonEmpty,
  city: nonEmpty,
  country: nonEmpty,
  registerNumber: nonEmpty,
  boardLines: z.array(
    z.object({
      id: stableId,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
  contentResponsible: optionalText,
});

export const globalNavigationSchema = z.object({
  items: z.array(navItemSchema),
});

export const globalSocialSchema = z.object({
  items: z.array(
    z.object({
      id: stableId,
      label: nonEmpty,
      url: siteLinkZod({ httpsOnly: true }),
      visible: z.boolean(),
      sortOrder: z.number().int(),
    }),
  ),
});

export const globalFooterSchema = z.object({
  tagline: nonEmpty,
  copyrightLine: nonEmpty,
  imprintLabel: nonEmpty,
  privacyLabel: nonEmpty,
});

// --- home ---

export const homeLandingSchema = z.object({
  title: nonEmpty,
  tagline: nonEmpty,
  ctaLabel: nonEmpty,
  ctaHref: linkField,
  heroImage: optionalMediaRefSchema,
});

export const homeConcertsIntroSchema = z.object({
  eyebrow: nonEmpty,
  emptyMessage: nonEmpty,
});

export const homeEnsemblesSchema = z.object({
  headline: nonEmpty,
  cards: z.array(
    z.object({
      id: stableId,
      title: nonEmpty,
      ctaLabel: nonEmpty,
      href: linkField,
      image: optionalMediaRefSchema,
      sortOrder: z.number().int(),
    }),
  ),
});

export const homeChorleitungSchema = z.object({
  eyebrow: nonEmpty,
  name: nonEmpty,
  body: nonEmpty,
  ctaLabel: nonEmpty,
  ctaHref: linkField,
  portrait: optionalMediaRefSchema,
});

export const homeSupportSchema = z.object({
  headline: optionalText,
  sponsors: z.array(
    z.object({
      id: stableId,
      label: nonEmpty,
      href: optionalHrefField,
      image: optionalMediaRefSchema,
      sortOrder: z.number().int(),
    }),
  ),
});

/** Legacy home/footer still parseable if present in DB; not seeded for new installs. */
export const homeFooterLegacySchema = z.object({
  tagline: nonEmpty,
  imprintHref: z.string().min(1),
  privacyHref: z.string().min(1),
});

// --- about ---

export const aboutHeroSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  intro: nonEmpty,
});

export const aboutHighlightsSchema = z.object({
  items: z.array(
    z.object({
      id: stableId,
      title: nonEmpty,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
});

export const aboutVereinSchema = z.object({
  title: nonEmpty,
  text: nonEmpty,
  ctas: z.array(
    z.object({
      id: stableId,
      label: nonEmpty,
      href: linkField,
      sortOrder: z.number().int(),
    }),
  ),
});

// --- chorleitung page ---

export const chorleitungHeroSchema = z.object({
  eyebrow: nonEmpty,
  name: nonEmpty,
  intro: nonEmpty,
  portrait: optionalMediaRefSchema,
});

export const chorleitungCardsSchema = z.object({
  items: z.array(
    z.object({
      id: stableId,
      title: nonEmpty,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
});

export const chorleitungHandschriftSchema = z.object({
  title: nonEmpty,
  text: nonEmpty,
  ctas: z.array(
    z.object({
      id: stableId,
      label: nonEmpty,
      href: linkField,
      sortOrder: z.number().int(),
    }),
  ),
});

// --- history ---

const historyImageItem = z.object({
  id: stableId,
  image: optionalMediaRefSchema,
  sortOrder: z.number().int(),
});

export const historyHeroSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  text: nonEmpty,
  backgroundImage: optionalMediaRefSchema,
  ctas: z.array(
    z.object({
      id: stableId,
      label: nonEmpty,
      href: linkField,
      sortOrder: z.number().int(),
    }),
  ),
});

export const historyIntroSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  paragraphs: z.array(nonEmpty).min(1),
  image: optionalMediaRefSchema,
});

export const historyTimelineSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  events: z.array(
    z.object({
      id: stableId,
      year: nonEmpty,
      title: nonEmpty,
      text: nonEmpty,
      images: z.array(historyImageItem),
      sortOrder: z.number().int(),
    }),
  ),
});

export const historyTripsSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  intro: nonEmpty,
  items: z.array(
    z.object({
      id: stableId,
      year: nonEmpty,
      location: nonEmpty,
      text: nonEmpty,
      images: z.array(historyImageItem),
      sortOrder: z.number().int(),
    }),
  ),
});

export const historyClosingSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  text: nonEmpty,
  ctaLabel: nonEmpty,
  ctaHref: linkField,
});

// --- proben ---

export const probenHeroSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  intro: nonEmpty,
});

export const probenCardsSchema = z.object({
  items: z.array(
    z.object({
      id: stableId,
      title: nonEmpty,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
});

export const probenCtaSchema = z.object({
  title: nonEmpty,
  text: nonEmpty,
  ctas: z.array(
    z.object({
      id: stableId,
      label: nonEmpty,
      href: linkField,
      sortOrder: z.number().int(),
    }),
  ),
});

export const probenFaqSchema = z.object({
  title: nonEmpty,
  items: z.array(
    z.object({
      id: stableId,
      question: nonEmpty,
      answer: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
});

// --- contact ---

export const contactHeroSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  intro: nonEmpty,
});

export const contactInfoSchema = z.object({
  emailTitle: nonEmpty,
  emailText: nonEmpty,
  /** Display email; org email remains SSOT for address when empty. */
  emailAddress: z.string().email().or(z.literal("")),
  locationTitle: nonEmpty,
  mitsingenTitle: nonEmpty,
  mitsingenText: nonEmpty,
  mitsingenCtaLabel: nonEmpty,
  mitsingenCtaHref: linkField,
  formEyebrow: nonEmpty,
  formTitle: nonEmpty,
});

// --- ensembles (shared shape) ---

export const ensembleHeroSchema = z.object({
  name: nonEmpty,
  eyebrow: nonEmpty,
  claim: nonEmpty,
  intro: nonEmpty,
  heroImage: optionalMediaRefSchema,
});

export const ensembleStorySchema = z.object({
  subtitle: nonEmpty,
  paragraphs: z.array(
    z.object({
      id: stableId,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
});

export const ensembleProfileSchema = z.object({
  subtitle: nonEmpty,
  items: z.array(
    z.object({
      id: stableId,
      title: nonEmpty,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
  highlights: z.array(
    z.object({
      id: stableId,
      text: nonEmpty,
      sortOrder: z.number().int(),
    }),
  ),
});

export const ensembleGallerySchema = z.object({
  items: z.array(
    z.object({
      id: stableId,
      image: optionalMediaRefSchema,
      sortOrder: z.number().int(),
    }),
  ),
});

export const ensembleCtaSchema = z.object({
  title: nonEmpty,
  text: nonEmpty,
});

export const SITE_SECTION_SCHEMAS: Record<
  string,
  Record<string, z.ZodTypeAny>
> = {
  global: {
    organization: globalOrganizationSchema,
    navigation: globalNavigationSchema,
    social: globalSocialSchema,
    footer: globalFooterSchema,
  },
  home: {
    landing: homeLandingSchema,
    concerts_intro: homeConcertsIntroSchema,
    ensembles: homeEnsemblesSchema,
    chorleitung: homeChorleitungSchema,
    support: homeSupportSchema,
    footer: homeFooterLegacySchema,
  },
  about: {
    hero: aboutHeroSchema,
    highlights: aboutHighlightsSchema,
    verein: aboutVereinSchema,
  },
  chorleitung: {
    hero: chorleitungHeroSchema,
    cards: chorleitungCardsSchema,
    handschrift: chorleitungHandschriftSchema,
  },
  history: {
    hero: historyHeroSchema,
    intro: historyIntroSchema,
    timeline: historyTimelineSchema,
    trips: historyTripsSchema,
    closing: historyClosingSchema,
  },
  proben: {
    hero: probenHeroSchema,
    cards: probenCardsSchema,
    cta: probenCtaSchema,
    faq: probenFaqSchema,
  },
  contact: {
    hero: contactHeroSchema,
    info: contactInfoSchema,
  },
  ensemble_elikuren: {
    hero: ensembleHeroSchema,
    story: ensembleStorySchema,
    profile: ensembleProfileSchema,
    gallery: ensembleGallerySchema,
    cta: ensembleCtaSchema,
  },
  ensemble_eight: {
    hero: ensembleHeroSchema,
    story: ensembleStorySchema,
    profile: ensembleProfileSchema,
    gallery: ensembleGallerySchema,
    cta: ensembleCtaSchema,
  },
  ensemble_musical: {
    hero: ensembleHeroSchema,
    story: ensembleStorySchema,
    profile: ensembleProfileSchema,
    gallery: ensembleGallerySchema,
    cta: ensembleCtaSchema,
  },
};

export function getSectionSchema(pageKey: string, sectionKey: string) {
  return SITE_SECTION_SCHEMAS[pageKey]?.[sectionKey] ?? null;
}

export function parseSectionData(
  pageKey: string,
  sectionKey: string,
  data: unknown,
):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string } {
  const schema = getSectionSchema(pageKey, sectionKey);
  if (!schema) {
    return { ok: false, error: `Unbekannte Sektion ${pageKey}/${sectionKey}` };
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues
        .map((i) => `${i.path.join(".") || "data"}: ${i.message}`)
        .join("; "),
    };
  }
  return { ok: true, data: result.data as Record<string, unknown> };
}

/**
 * Ensures update payloads do not silently regenerate every list id.
 * Allows add/remove; rejects full id-set replacement when sizes match and overlap is empty.
 */
export function assertStableListIdsPreserved(
  previous: unknown,
  next: unknown,
  listPath: string,
): { ok: true } | { ok: false; error: string } {
  const prevItems = extractIdList(previous, listPath);
  const nextItems = extractIdList(next, listPath);
  if (prevItems === null || nextItems === null) return { ok: true };
  if (prevItems.length === 0 || nextItems.length === 0) return { ok: true };

  const prevSet = new Set(prevItems);
  const overlap = nextItems.filter((id) => prevSet.has(id)).length;
  if (
    prevItems.length === nextItems.length &&
    overlap === 0 &&
    prevItems.length > 0
  ) {
    return {
      ok: false,
      error: `Listen-IDs unter "${listPath}" wurden ersetzt statt beibehalten`,
    };
  }
  return { ok: true };
}

function extractIdList(data: unknown, path: string): string[] | null {
  if (!data || typeof data !== "object") return null;
  const parts = path.split(".");
  let cur: unknown = data;
  for (const part of parts) {
    if (!cur || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (!Array.isArray(cur)) return null;
  const ids: string[] = [];
  for (const item of cur) {
    if (!item || typeof item !== "object") return null;
    const id = (item as { id?: unknown }).id;
    if (typeof id !== "string" || !id) return null;
    ids.push(id);
  }
  return ids;
}

