import Image from "next/image";

import { SiteLink } from "@/components/site/site-link";
import { Button } from "@/components/ui/button";
import { resolveCmsMedia } from "@/lib/site-content/media";
import { getSectionDataPublic } from "@/lib/site-content";

export default async function LandingPage() {
  const landing = await getSectionDataPublic<{
    title: string;
    tagline: string;
    ctaLabel: string;
    ctaHref: string;
    heroImage: unknown;
  }>("home", "landing");

  if (!landing) {
    console.error("[site-content] home/landing missing or invalid");
    return null;
  }

  const hero = await resolveCmsMedia(landing.heroImage);

  return (
    <section id="landing" className="relative h-screen min-h-screen w-full">
      {hero ? (
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          className="object-cover"
          priority
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 lg:from-black/40 to-black/90" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
        <Image src="/Logo.svg" alt="" width={180} height={180} priority />
        <p className="text-4xl text-primary lg:text-6xl">{landing.title}</p>
        <p className="text-xl text-second-background lg:text-4xl">
          {landing.tagline}
        </p>
        <Button size="xl" asChild className="mt-8">
          <SiteLink href={landing.ctaHref}>{landing.ctaLabel}</SiteLink>
        </Button>
      </div>
    </section>
  );
}
