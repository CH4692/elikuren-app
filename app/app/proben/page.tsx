import Link from "next/link";
import { CalendarDays, MapPin, Mic2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaqSection } from "@/components/choir/faq-section";

const rehearsalCards = [
  {
    icon: CalendarDays,
    title: "Probenrhythmus",
    text: "Regelmäßige Proben in Wunstorf – intensiv vor Konzerten, mit Raum für Stimmbildung und Ensembleklang.",
  },
  {
    icon: MapPin,
    title: "Ort",
    text: "Proben und Konzerte finden in und um Wunstorf statt, häufig in Kirchen und lokalen Veranstaltungsräumen.",
  },
  {
    icon: Mic2,
    title: "Was wir suchen",
    text: "Stimmlich interessierte Sängerinnen und Sänger mit Freude an anspruchsvoller Chormusik und verlässlicher Probenarbeit.",
  },
  {
    icon: Sparkles,
    title: "Einstieg",
    text: "Du kannst dich unverbindlich melden. Neue Mitglieder werden nach kurzer Absprache und Freigabe durch den Vorstand aufgenommen.",
  },
];

export default function ProbenPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="bg-second-primary text-white mt-24">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
            Mitsingen
          </p>
          <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
            Proben & Einstieg
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
            Ob im Kammerchor Elikuren, im musical team oder bei eight to the
            bar – wir verbinden sorgfältige Probenarbeit mit der Freude am
            gemeinsamen Klang.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2">
          {rehearsalCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <card.icon className="mb-2 size-6 text-primary" />
                <CardTitle>{card.title}</CardTitle>
                <CardDescription className="leading-7">
                  {card.text}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Interessiert?</CardTitle>
            <CardDescription>
              Stelle eine Mitgliedsanfrage. Nach Prüfung durch den Vorstand
              erhältst du einen Magic Link zur Anmeldung.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/sign-up">Mitgliedschaft beantragen</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Fragen stellen</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-16">
          <FaqSection />
        </div>
      </section>
    </main>
  );
}
