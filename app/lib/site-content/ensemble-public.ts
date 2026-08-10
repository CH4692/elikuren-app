import { Music4, Sparkles, Users, type LucideIcon } from "lucide-react";

import type { EnsembleData } from "@/components/ensemble_content";
import { getPublicSiteSections } from "@/lib/site-content";
import { resolveCmsMedia, resolveCmsMediaMany } from "@/lib/site-content/media";

const PROFILE_ICONS: LucideIcon[] = [Music4, Sparkles, Users];

export async function loadEnsemblePublic(
  pageKey: "ensemble_elikuren" | "ensemble_eight" | "ensemble_musical",
): Promise<EnsembleData | null> {
  const sections = await getPublicSiteSections(pageKey);
  const byKey = new Map(sections.map((s) => [s.key, s.data]));

  const hero = byKey.get("hero") as
    | {
        name: string;
        eyebrow: string;
        claim: string;
        intro: string;
        heroImage: unknown;
      }
    | undefined;
  const story = byKey.get("story") as
    | {
        subtitle: string;
        paragraphs: Array<{ id: string; text: string; sortOrder: number }>;
      }
    | undefined;
  const profile = byKey.get("profile") as
    | {
        subtitle: string;
        items: Array<{
          id: string;
          title: string;
          text: string;
          sortOrder: number;
        }>;
        highlights: Array<{ id: string; text: string; sortOrder: number }>;
      }
    | undefined;
  const gallery = byKey.get("gallery") as
    | {
        items: Array<{ id: string; image: unknown; sortOrder: number }>;
      }
    | undefined;
  const cta = byKey.get("cta") as
    | { title: string; text: string }
    | undefined;

  if (!hero || !story || !profile || !cta) {
    console.error(`[site-content] incomplete ensemble page ${pageKey}`);
    return null;
  }

  const heroMedia = await resolveCmsMedia(hero.heroImage);

  const galleryItems = gallery
    ? [...gallery.items].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const galleryMedia = await resolveCmsMediaMany(
    galleryItems.map((item) => item.image),
  );

  const storyParagraphs = [...story.paragraphs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => ({ id: p.id, text: p.text }));

  const profileItems = [...profile.items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      id: item.id,
      title: item.title,
      text: item.text,
      icon: PROFILE_ICONS[index % PROFILE_ICONS.length]!,
    }));

  const highlights = [...profile.highlights]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((h) => ({ id: h.id, text: h.text }));

  const images: EnsembleData["images"] = [];
  if (heroMedia) {
    images.push({
      id: "hero",
      src: heroMedia.src,
      alt: heroMedia.alt || hero.name,
    });
  }
  for (let index = 0; index < galleryItems.length; index++) {
    const item = galleryItems[index]!;
    const media = galleryMedia[index];
    if (!media) continue;
    images.push({
      id: item.id,
      src: media.src,
      alt: media.alt || hero.name,
    });
  }

  return {
    name: hero.name,
    eyebrow: hero.eyebrow || "Ensemble",
    claim: hero.claim,
    intro: hero.intro,
    story: storyParagraphs,
    subtitle1: story.subtitle,
    subtitle2: profile.subtitle,
    profile: profileItems,
    highlights,
    ctaTitle: cta.title,
    ctaText: cta.text,
    images,
    showGallery: galleryItems.length > 0,
  };
}
