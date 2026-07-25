import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChorleitungPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="bg-second-primary text-white mt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-24 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
              Chorleitung
            </p>
            <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
              Christiane Kampe
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Christiane Kampe prägt seit Jahrzehnten die Chorszene in Wunstorf.
              Als erfahrene Musikpädagogin und Chorleiterin verbindet sie
              künstlerischen Anspruch mit einer offenen, motivierenden
              Probenarbeit – im Kammerchor Elikuren ebenso wie in weiteren
              Ensembles.
            </p>
          </div>
          <div className="relative mx-auto h-72 w-72 overflow-hidden rounded-full lg:h-[26rem] lg:w-[26rem]">
            <Image
              src="/chorleitung.jpg"
              alt="Christiane Kampe"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-20 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Musikschule Wunstorf</CardTitle>
              <CardDescription className="leading-7">
                Seit 1987 war Christiane Kampe an der Musikschule Wunstorf tätig
                und hat Generationen von Sängerinnen und Sängern geprägt – bis
                hin zur Vorbereitung auf ein Musikstudium.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ensembles & Produktionen</CardTitle>
              <CardDescription className="leading-7">
                Neben dem Kammerchor Elikuren arbeitete sie mit Formationen wie
                dem musical team und eight to the bar sowie in zahlreichen
                Musical-Produktionen.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Konzertreisen</CardTitle>
              <CardDescription className="leading-7">
                Mit dem Kammerchor unternahm sie regelmäßig Konzertreisen im
                Ausland und öffnete den Chor für kulturelle Begegnungen über
                Wunstorf hinaus.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Musikalische Handschrift</CardTitle>
            <CardDescription className="leading-7">
              Programme unter ihrer Leitung reichen von romantischer Chormusik
              (u. a. Mendelssohn, Rheinberger, Schubert, Elgar) bis zu
              stimmungsvollen Pop- und Jazzarrangements. Im Mittelpunkt stehen
              klangliche Feinheit, stilistische Vielfalt und die Freude am
              gemeinsamen Auftritt.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/home#concerts">Aktuelle Konzerte</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Probe besuchen</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
