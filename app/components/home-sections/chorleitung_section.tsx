import Image from "next/image";

import { SiteLink } from "@/components/site/site-link";
import { Button } from "@/components/ui/button";
import { getSectionDataPublic } from "@/lib/site-content";
import { resolveCmsMedia } from "@/lib/site-content/media";

export default async function ChorleitungPage() {
  const data = await getSectionDataPublic<{
    eyebrow: string;
    name: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    portrait: unknown;
  }>("home", "chorleitung");

  if (!data) return null;

  const portrait = await resolveCmsMedia(data.portrait);

  return (
    <section
      id="chorleitung"
      className="flex min-h-screen w-full items-center justify-center bg-second-primary lg:gap-41"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 p-4 pt-25 lg:grid-cols-2">
        <div className="flex justify-center">
          <div className="relative h-72 w-72 overflow-hidden rounded-full md:w-[28rem] lg:h-[28rem]">
            {portrait ? (
              <Image
                src={portrait.src}
                alt={portrait.alt || data.name}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="text-white">
          <p className="mb-6 text-sm font-light leading-tight uppercase tracking-[0.2em] text-primary">
            {data.eyebrow}
          </p>

          <h2 className="mb-6 text-4xl font-bold lg:text-5xl">{data.name}</h2>

          <p className="max-w-xl text-lg leading-8 text-foreground/90">
            {data.body}
          </p>

          <Button className="mt-4" size="xl" asChild>
            <SiteLink href={data.ctaHref}>{data.ctaLabel}</SiteLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
