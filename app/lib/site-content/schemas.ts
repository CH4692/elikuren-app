import { z } from "zod";

/** Content images require altText; decorative may use empty alt. */
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

export const homeLandingSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  subline: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
});

export const homeConcertsIntroSchema = z.object({
  eyebrow: z.string().min(1),
  emptyMessage: z.string().min(1),
});

export const homeEnsemblesSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string(),
});

export const homeChorleitungSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string(),
  name: z.string().min(1),
});

export const homeSupportSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string(),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
});

export const homeFooterSchema = z.object({
  tagline: z.string().min(1),
  imprintHref: z.string().min(1),
  privacyHref: z.string().min(1),
});

export const SITE_SECTION_SCHEMAS: Record<
  string,
  Record<string, z.ZodTypeAny>
> = {
  home: {
    landing: homeLandingSchema,
    concerts_intro: homeConcertsIntroSchema,
    ensembles: homeEnsemblesSchema,
    chorleitung: homeChorleitungSchema,
    support: homeSupportSchema,
    footer: homeFooterSchema,
  },
};

export const SITE_PAGE_DEFS: {
  key: string;
  title: string;
  sections: { key: string; label: string; defaults: Record<string, unknown> }[];
}[] = [
  {
    key: "home",
    title: "Startseite",
    sections: [
      {
        key: "landing",
        label: "Hero / Landing",
        defaults: {
          eyebrow: "Kammerchor",
          headline: "Elikuren",
          subline: "Chormusik erleben",
          ctaLabel: "Konzerte",
          ctaHref: "#concerts",
        },
      },
      {
        key: "concerts_intro",
        label: "Konzerte (Intro)",
        defaults: {
          eyebrow: "Konzerte",
          emptyMessage: "Aktuell sind keine öffentlichen Konzerte geplant.",
        },
      },
      {
        key: "ensembles",
        label: "Ensembles",
        defaults: {
          eyebrow: "Ensembles",
          headline: "Unsere Stimmen",
          body: "",
        },
      },
      {
        key: "chorleitung",
        label: "Chorleitung",
        defaults: {
          eyebrow: "Chorleitung",
          headline: "Musikalische Leitung",
          body: "",
          name: "Christiane Kampe",
        },
      },
      {
        key: "support",
        label: "Unterstützen",
        defaults: {
          eyebrow: "Fördern",
          headline: "Unterstützen Sie uns",
          body: "",
          ctaLabel: "Kontakt",
          ctaHref: "/contact",
        },
      },
      {
        key: "footer",
        label: "Footer",
        defaults: {
          tagline: "Kammerchor Elikuren",
          imprintHref: "/impressum",
          privacyHref: "/datenschutz",
        },
      },
    ],
  },
];

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
      error: result.error.issues.map((i) => i.message).join("; "),
    };
  }
  return { ok: true, data: result.data as Record<string, unknown> };
}
