import { HeartHandshake, Music4, Plane, Users } from "lucide-react";

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
  return buildPublicPageMetadata("about");
}

const HIGHLIGHT_ICONS = [Music4, Plane, HeartHandshake, Users] as const;

export default async function AboutPage() {
  const [hero, highlights, verein] = await Promise.all([
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      intro: string;
    }>("about", "hero"),
    getSectionDataPublic<{
      items: Array<{
        id: string;
        title: string;
        text: string;
        sortOrder: number;
      }>;
    }>("about", "highlights"),
    getSectionDataPublic<{
      title: string;
      text: string;
      ctas: Array<{
        id: string;
        label: string;
        href: string;
        sortOrder: number;
      }>;
    }>("about", "verein"),
  ]);

  if (!hero) {
    console.error("[site-content] about/hero missing");
    return null;
  }

  const highlightItems = highlights
    ? [...highlights.items].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const ctas = verein
    ? [...verein.ctas].sort((a, b) => a.sortOrder - b.sortOrder)
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
        {highlightItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {highlightItems.map((item, index) => {
              const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]!;
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <Icon className="mb-2 size-6 text-primary" />
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="leading-7">
                      {item.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : null}

        {verein ? (
          <Card className="mt-10">
            <CardHeader>
              <CardTitle>{verein.title}</CardTitle>
              <CardDescription>{verein.text}</CardDescription>
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
