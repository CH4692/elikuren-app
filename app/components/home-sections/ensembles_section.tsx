import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { SiteLink } from "@/components/site/site-link";
import { getSectionDataPublic } from "@/lib/site-content";
import { resolveCmsMediaMany } from "@/lib/site-content/media";

type Card = {
  id: string;
  title: string;
  ctaLabel: string;
  href: string;
  image: unknown;
  sortOrder: number;
};

export default async function EnsemblesPage() {
  const data = await getSectionDataPublic<{
    headline: string;
    cards: Card[];
  }>("home", "ensembles");

  if (!data) return null;

  const cards = [...data.cards].sort((a, b) => a.sortOrder - b.sortOrder);
  const images = await resolveCmsMediaMany(cards.map((card) => card.image));

  return (
    <section
      id="joinus"
      className="flex w-full items-center justify-center bg-second-background p-4 pt-24 lg:min-h-screen lg:pt-0"
    >
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-12 text-center text-5xl font-bold text-[#173f34]">
          {data.headline}
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => {
            const image = images[index];
            return (
              <SiteLink
                key={card.id}
                href={card.href}
                className="group relative block w-full overflow-hidden rounded-3xl"
              >
                <div className="relative h-[320px] w-full">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || card.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-black/60 transition-colors duration-300 group-hover:bg-black/55" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
                    <h3 className="text-3xl font-semibold text-primary">
                      {card.title}
                    </h3>

                    <div className="inline-flex items-center gap-3 rounded-xl border border-primary px-3 py-2 text-lg font-medium text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-background">
                      <span>{card.ctaLabel}</span>
                      <ArrowRight className="size-5" />
                    </div>
                  </div>
                </div>
              </SiteLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
