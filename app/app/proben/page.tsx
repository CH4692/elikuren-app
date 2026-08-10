import { CalendarDays, MapPin, Mic2, Sparkles } from "lucide-react";

import { FaqSection } from "@/components/choir/faq-section";
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
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

export async function generateMetadata() {
  return buildPublicPageMetadata("proben");
}

const CARD_ICONS = [CalendarDays, MapPin, Mic2, Sparkles] as const;

export default async function ProbenPage() {
  const [hero, cards, cta, faq] = await Promise.all([
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      intro: string;
    }>("proben", "hero"),
    getSectionDataPublic<{
      items: Array<{
        id: string;
        title: string;
        text: string;
        sortOrder: number;
      }>;
    }>("proben", "cards"),
    getSectionDataPublic<{
      title: string;
      text: string;
      ctas: Array<{
        id: string;
        label: string;
        href: string;
        sortOrder: number;
      }>;
    }>("proben", "cta"),
    getSectionDataPublic<{
      title: string;
      items: Array<{
        id: string;
        question: string;
        answer: string;
        sortOrder: number;
      }>;
    }>("proben", "faq"),
  ]);

  if (!hero) {
    console.error("[site-content] proben/hero missing");
    return null;
  }

  const cardItems = cards
    ? [...cards.items].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const ctas = cta
    ? [...cta.ctas].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const faqItems = faq
    ? [...faq.items]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        }))
    : [];

  return (
    <main className="bg-background text-foreground">
      <section className="mt-24 bg-second-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
            {hero.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        {cardItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {cardItems.map((card, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length]!;
              return (
                <Card key={card.id}>
                  <CardHeader>
                    <Icon className="mb-2 size-6 text-primary" />
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription className="leading-7">
                      {card.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : null}

        {cta ? (
          <Card className="mt-10">
            <CardHeader>
              <CardTitle>{cta.title}</CardTitle>
              <CardDescription>{cta.text}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {ctas.map((item, index) => (
                <Button
                  key={item.id}
                  variant={index === 0 ? "default" : "outline"}
                  asChild
                >
                  <SiteLink href={item.href}>{item.label}</SiteLink>
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {faq ? (
          <div className="mt-16">
            <FaqSection title={faq.title} items={faqItems} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
