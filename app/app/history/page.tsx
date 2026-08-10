import { ArrowRight, MapPin, Music4, Plane, ScrollText } from "lucide-react";
import Image from "next/image";

import { SiteLink } from "@/components/site/site-link";
import { getSectionDataPublic } from "@/lib/site-content";
import { resolveCmsMedia, resolveCmsMediaMany } from "@/lib/site-content/media";
import { buildPublicPageMetadata } from "@/lib/site-content/seo";

export async function generateMetadata() {
  return buildPublicPageMetadata("history");
}

type ImageItem = { id: string; image: unknown; sortOrder: number };

export default async function HistoryPage() {
  const [hero, intro, timeline, trips, closing] = await Promise.all([
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      text: string;
      backgroundImage: unknown;
      ctas: Array<{
        id: string;
        label: string;
        href: string;
        sortOrder: number;
      }>;
    }>("history", "hero"),
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      paragraphs: string[];
      image: unknown;
    }>("history", "intro"),
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      events: Array<{
        id: string;
        year: string;
        title: string;
        text: string;
        images: ImageItem[];
        sortOrder: number;
      }>;
    }>("history", "timeline"),
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      intro: string;
      items: Array<{
        id: string;
        year: string;
        location: string;
        text: string;
        images: ImageItem[];
        sortOrder: number;
      }>;
    }>("history", "trips"),
    getSectionDataPublic<{
      eyebrow: string;
      title: string;
      text: string;
      ctaLabel: string;
      ctaHref: string;
    }>("history", "closing"),
  ]);

  if (!hero) {
    console.error("[site-content] history/hero missing");
    return null;
  }

  const heroBg = await resolveCmsMedia(hero.backgroundImage);
  const introImage = intro ? await resolveCmsMedia(intro.image) : null;

  const events = timeline
    ? [...timeline.events].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const tripItems = trips
    ? [...trips.items].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const allEventImages = events.flatMap((event) =>
    [...event.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        ref: img.image,
        id: img.id,
        eventId: event.id,
      })),
  );
  const resolvedEventImages = await resolveCmsMediaMany(
    allEventImages.map((item) => item.ref),
  );
  const eventImageMap = new Map(
    allEventImages.map((item, index) => [item.id, resolvedEventImages[index]]),
  );

  const allTripImages = tripItems.flatMap((trip) =>
    [...trip.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        ref: img.image,
        id: img.id,
      })),
  );
  const resolvedTripImages = await resolveCmsMediaMany(
    allTripImages.map((item) => item.ref),
  );
  const tripImageMap = new Map(
    allTripImages.map((item, index) => [item.id, resolvedTripImages[index]]),
  );

  const heroCtas = [...hero.ctas].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="mt-24 bg-background text-foreground">
      <section className="relative overflow-hidden bg-second-primary text-white">
        <div className="absolute inset-0">
          {heroBg ? (
            <Image
              src={heroBg.src}
              alt={heroBg.alt}
              fill
              priority
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-[#1F1F23]/70" />
        </div>

        <div className="relative mx-auto flex min-h-[75svh] max-w-7xl items-center px-6 py-24 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#C8A24D]">
              {hero.eyebrow}
            </p>

            <h1 className="text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              {hero.text}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {heroCtas.map((cta, index) => (
                <SiteLink
                  key={cta.id}
                  href={cta.href}
                  className={
                    index === 0
                      ? "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                      : "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
                  }
                >
                  {cta.label}
                  {index === 0 ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : (
                    <ScrollText className="h-4 w-4" />
                  )}
                </SiteLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {intro ? (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">
                {intro.eyebrow}
              </p>

              <h2 className="mt-4 text-3xl font-light sm:text-4xl">
                {intro.title}
              </h2>

              <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
                {intro.paragraphs.map((paragraph, index) => (
                  <p key={`intro-p-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>

            {introImage ? (
              <div className="overflow-hidden rounded-[2rem] shadow-xl">
                <Image
                  src={introImage.src}
                  alt={introImage.alt}
                  width={1200}
                  height={900}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {timeline && events.length > 0 ? (
        <section className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.25em] text-primary">
                {timeline.eyebrow}
              </p>

              <h2 className="mt-4 text-3xl font-light sm:text-4xl">
                {timeline.title}
              </h2>
            </div>

            <div className="mt-14 space-y-16">
              {events.map((event) => {
                const images = [...event.images]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((img) => ({
                    id: img.id,
                    media: eventImageMap.get(img.id),
                  }))
                  .filter((img) => img.media);
                return (
                  <article
                    key={event.id}
                    className="grid gap-8 lg:grid-cols-[180px_1fr]"
                  >
                    <div className="relative">
                      <div className="sticky top-24">
                        <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                          {event.year}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:p-8">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Music4 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-medium">{event.title}</h3>
                          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                            {event.text}
                          </p>
                        </div>
                      </div>

                      {images.length > 0 ? (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                          {images.map((image) => (
                            <div
                              key={image.id}
                              className="overflow-hidden rounded-[1.5rem]"
                            >
                              <Image
                                src={image.media!.src}
                                alt={image.media!.alt}
                                width={1000}
                                height={750}
                                className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {trips && tripItems.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-primary">
              {trips.eyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-light sm:text-4xl">
              {trips.title}
            </h2>

            <p className="mt-6 text-base leading-8 text-muted-foreground">
              {trips.intro}
            </p>
          </div>

          <div className="mt-14 space-y-12">
            {tripItems.map((trip, index) => {
              const images = [...trip.images]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((img) => ({
                  id: img.id,
                  media: tripImageMap.get(img.id),
                }))
                .filter((img) => img.media);
              return (
                <article
                  key={trip.id}
                  className="grid gap-8 rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:grid-cols-[1fr_1.1fr] lg:p-8"
                >
                  <div
                    className={
                      index % 2 === 0 ? "order-1" : "order-1 lg:order-2"
                    }
                  >
                    <div className="flex items-center gap-3 text-primary">
                      <Plane className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-[0.2em]">
                        {trip.year}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-medium">
                      {trip.location}
                    </h3>

                    <div className="mt-4 flex items-start gap-3 text-muted-foreground">
                      <MapPin className="mt-1 h-4 w-4 min-w-4 text-[#C8A24D]" />
                      <p className="text-sm leading-7 sm:text-base">
                        {trip.text}
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      index % 2 === 0
                        ? "order-2 grid gap-6 sm:grid-cols-2"
                        : "order-2 grid gap-6 sm:grid-cols-2 lg:order-1"
                    }
                  >
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-[1.5rem]"
                      >
                        <Image
                          src={image.media!.src}
                          alt={image.media!.alt}
                          width={1000}
                          height={750}
                          className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                        />
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {closing ? (
        <section className="bg-second-primary text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-sm lg:p-10">
              <p className="text-sm uppercase tracking-[0.25em] text-[#C8A24D]">
                {closing.eyebrow}
              </p>

              <h2 className="mt-4 text-3xl font-light sm:text-4xl">
                {closing.title}
              </h2>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/80">
                {closing.text}
              </p>

              <div className="mt-8">
                <SiteLink
                  href={closing.ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  {closing.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </SiteLink>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
