import Image from "next/image";

import { CmsParagraphs } from "@/components/site/cms-paragraphs";
import { SiteLink } from "@/components/site/site-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSectionDataPublic } from "@/lib/site-content";
import { resolveCmsMedia } from "@/lib/site-content/media";
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

export async function generateMetadata() {
  return buildPublicPageMetadata("chorleitung");
}

export default async function ChorleitungPage() {
  const [hero, cards, handschrift] = await Promise.all([
    getSectionDataPublic<{
      eyebrow: string;
      name: string;
      intro: string;
      portrait: unknown;
    }>("chorleitung", "hero"),
    getSectionDataPublic<{
      items: Array<{
        id: string;
        title: string;
        text: string;
        sortOrder: number;
      }>;
    }>("chorleitung", "cards"),
    getSectionDataPublic<{
      title: string;
      text: string;
      ctas: Array<{
        id: string;
        label: string;
        href: string;
        sortOrder: number;
      }>;
    }>("chorleitung", "handschrift"),
  ]);

  if (!hero) {
    console.error("[site-content] chorleitung/hero missing");
    return null;
  }

  const portrait = await resolveCmsMedia(hero.portrait);
  const cardItems = cards
    ? [...cards.items].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const ctas = handschrift
    ? [...handschrift.ctas].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <main className="bg-background text-foreground">
      <section className="mt-24 bg-second-primary text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-24 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
              {hero.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
              {hero.name}
            </h1>
            <CmsParagraphs
              text={hero.intro}
              className="mt-6 max-w-xl"
              paragraphClassName="text-base leading-8 text-white/80 sm:text-lg"
            />
          </div>
          <div className="relative mx-auto h-72 w-72 overflow-hidden rounded-full lg:h-[26rem] lg:w-[26rem]">
            {portrait ? (
              <Image
                src={portrait.src}
                alt={portrait.alt || hero.name}
                fill
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-20 lg:px-12">
        {cardItems.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {cardItems.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="leading-7">
                    {card.text}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : null}

        {handschrift ? (
          <Card>
            <CardHeader>
              <CardTitle>{handschrift.title}</CardTitle>
              <CardDescription className="leading-7">
                <CmsParagraphs text={handschrift.text} className="space-y-3" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {ctas.map((cta, index) => (
                <Button
                  key={cta.id}
                  variant={index === 0 ? "default" : "outline"}
                  asChild
                >
                  <SiteLink href={cta.href}>{cta.label}</SiteLink>
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
