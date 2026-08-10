import { ArrowRight, CalendarDays, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type EnsembleData = {
  name: string;
  eyebrow: string;
  claim: string;
  intro: string;
  story: Array<{ id: string; text: string }>;
  subtitle1: string;
  subtitle2: string;
  profile: Array<{
    id: string;
    title: string;
    text: string;
    icon: LucideIcon;
  }>;
  highlights: Array<{ id: string; text: string }>;
  ctaTitle: string;
  ctaText: string;
  images: Array<{ id: string; src: string; alt: string }>;
  showGallery?: boolean;
};

export default function EnsembleContent({
  ensemble,
}: {
  ensemble: EnsembleData;
}) {
  const heroImage = ensemble.images[0];
  const storyImage = ensemble.images[1] ?? ensemble.images[0];
  const galleryImages = ensemble.images.slice(1);

  return (
    <>
      <section className="relative mt-24 overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative mx-auto flex min-h-[82svh] max-w-7xl items-center px-6 py-24 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
              {ensemble.eyebrow}
            </p>

            <h1 className="text-4xl font-light leading-tight text-white sm:text-5xl lg:text-7xl">
              {ensemble.name}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              {ensemble.claim}
            </p>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80">
              {ensemble.intro}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Kontakt aufnehmen
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/home#concerts"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Konzerte ansehen
                <CalendarDays className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary">
              Wer wir sind
            </p>

            <h2 className="mt-4 text-3xl font-light sm:text-4xl">
              {ensemble.subtitle1}
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
              {ensemble.story.map((paragraph) => (
                <p key={paragraph.id}>{paragraph.text}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {ensemble.highlights.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-second-background bg-secondary px-4 py-2 text-sm text-second-background"
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {storyImage ? (
            <div className="overflow-hidden rounded-[2rem] shadow-xl">
              <Image
                src={storyImage.src}
                alt={storyImage.alt}
                width={1200}
                height={900}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <p className="text-sm uppercase tracking-[0.25em] text-primary">
            Profil
          </p>

          <h2 className="mt-4 text-3xl font-light sm:text-4xl">
            {ensemble.subtitle2}
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ensemble.profile.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.id}
                  className="rounded-[1.75rem] border border-border bg-background p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-xl font-medium">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {ensemble.showGallery !== false && galleryImages.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">
                Eindrücke
              </p>
              <h2 className="mt-4 text-3xl font-light sm:text-4xl">
                Bilder aus Proben und Auftritten
              </h2>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-[1.75rem] shadow-sm"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1000}
                  height={800}
                  className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-second-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-sm lg:p-10">
            <p className="text-sm uppercase tracking-[0.25em] text-[#d4aa43]">
              Kontakt
            </p>

            <h2 className="mt-4 text-3xl font-light sm:text-4xl">
              {ensemble.ctaTitle}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              {ensemble.ctaText}
            </p>

            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Jetzt Kontakt aufnehmen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
