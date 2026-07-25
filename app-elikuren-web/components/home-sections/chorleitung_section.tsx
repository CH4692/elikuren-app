import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ChorleitungPage() {
  return (
    <section
      id="chorleitung"
      className="min-h-screen w-full flex lg:gap-41 justify-center items-center bg-second-primary"
    >
      <div className="mx-auto grid max-w-7xl p-4 pt-25 items-center gap-8 lg:grid-cols-2">
        <div className="flex justify-center">
          <div className="relative h-72 w-72 overflow-hidden rounded-full lg:h-[28rem] md:w-[28rem]">
            <Image
              src="/chorleitung.jpg"
              alt="Christiane Kampe"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="text-white">
          <p className="mb-6 text-sm uppercase tracking-[0.2em] text-primary font-light leading-tight">
            Chorleitung
          </p>

          <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
            Christiane Kampe
          </h2>

          <p className="max-w-xl text-lg leading-8 text-foreground/90">
            Seit vielen Jahren prägt Christiane Kampe die musikalische Identität
            unseres Chores mit Leidenschaft, Erfahrung und musikalischer Tiefe.
            Sie war über Jahrzehnte als engagierte Musikpädagogin an der
            Musikschule Wunstorf tätig und führte zahlreiche Chöre und Ensembles
            zu künstlerischen Höhepunkten – von anspruchsvollen Konzerten bis
            hin zu festlichen Auftritten in der Region.
          </p>

          <Button className="mt-4" size="xl" asChild>
            <Link href="/chorleitung">Mehr erfahren</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
