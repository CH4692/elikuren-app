import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <section id="landing" className="relative h-screen min-h-screen w-full">
      <Image
        src="/kammerchor.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 lg:from-black/40 to-black/90" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <Image src="/Logo.svg" alt="Logo" width={180} height={180} priority />
        <p className="lg:text-6xl text-4xl text-primary ">
          Kammerchor Elikuren
        </p>
        <p className="lg:text-4xl text-xl text-second-background">
          Musik, die verbindet. Stimmen, die berühren.
        </p>
        <Button size="xl" asChild className="mt-8">
          <Link href="/home#concerts">Konzerte entdecken</Link>
        </Button>
      </div>
    </section>
  );
}
