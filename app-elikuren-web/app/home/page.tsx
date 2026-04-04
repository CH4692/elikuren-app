import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="relative h-screen w-full">
      <Image
        src="/kammerchor.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <Image src="/Logo.svg" alt="Logo" width={180} height={180} priority />
        <p className="text-6xl text-primary ">Kammerchor Elikuren</p>
        <p className="text-4xl text-second-background">
          Musik, die verbindet. Stimmen, die berühren.
        </p>
        <Button size="xl" asChild className="mt-8">
          <Link href="/concerts">Konzerte entdecken</Link>
        </Button>
      </div>
    </main>
  );
}
