import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type EnsembleCardProps = {
  title: string;
  href: string;
  image: string;
  cta: string;
};

function EnsembleCard({ title, href, image, cta }: EnsembleCardProps) {
  return (
    <Link
      href={href}
      className="group relative block w-full overflow-hidden rounded-3xl"
    >
      <div className="relative h-[320px] w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/60 transition-colors duration-300 group-hover:bg-black/55" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
          <h3 className="text-3xl font-semibold text-primary">{title}</h3>

          <div className="inline-flex items-center gap-3 rounded-xl border border-primary px-3 py-2 text-lg font-medium text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-background">
            <span>{cta}</span>
            <ArrowRight className="size-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function EnsembleCardDisabled({ title, href, image, cta }: EnsembleCardProps) {
  return (
    <div className="group relative block w-full overflow-hidden rounded-3xl cursor-not-allowed">
      <div className="relative h-[320px] w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/60 transition-colors duration-300 group-hover:bg-black/55" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
          <h3 className="text-3xl font-semibold text-primary">{title}</h3>

          <div className="inline-flex items-center gap-3 rounded-xl border border-primary px-3 py-2 text-lg font-medium text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-background">
            <span>{cta}</span>
            <ArrowRight className="size-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnsemblesPage() {
  return (
    <section
      id="joinus"
      className="w-full bg-second-background p-4 lg:min-h-screen pt-24 lg:pt-0 flex justify-center items-center"
    >
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-12 text-center text-5xl font-bold text-[#173f34]">
          Unsere Ensembles
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          <EnsembleCard
            title="Eight-to-the-Bar"
            href="/ensembles/eight-to-the-bar"
            image="/eight-to-the-bar.jpg"
            cta="Männerchor entdecken"
          />

          <EnsembleCard
            title="Elikuren"
            href="/ensembles/elikuren"
            image="/elikuren-ensemble.jpg"
            cta="Elikuren entdecken"
          />

          <EnsembleCard
            title="musical team"
            href="/ensembles/musical-team"
            image="/musical-team.jpg"
            cta="musical team entdecken"
          />
        </div>
      </div>
    </section>
  );
}
