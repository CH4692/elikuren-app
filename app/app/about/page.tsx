import Link from "next/link";
import { HeartHandshake, Music4, Plane, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    icon: Music4,
    title: "Künstlerisches Profil",
    text: "Anspruchsvolle Chormusik aus Wunstorf – von romantischer Literatur über moderne Werke bis zu Musical- und Poparrangements.",
  },
  {
    icon: Plane,
    title: "Konzerte & Reisen",
    text: "Regelmäßige Auftritte in der Region und Konzertreisen im In- und Ausland, darunter kulturelle Begegnungen wie die geplante Reise nach Como.",
  },
  {
    icon: HeartHandshake,
    title: "Soziales Engagement",
    text: "Mit Benefizkonzerten unterstützt der Chor soziale Projekte – unter anderem den Bau einer Geburtsstation in Ghana.",
  },
  {
    icon: Users,
    title: "Verein & Gemeinschaft",
    text: "Als Kammerchor Elikuren e. V. (Amtsgericht Hannover, VR 203208) verbinden wir musikalischen Anspruch mit lebendiger Chorgemeinschaft.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="bg-second-primary text-white mt-24">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
            Über uns
          </p>
          <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
            Kammerchor Elikuren e. V.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
            Der Kammerchor Elikuren ist ein Vokalensemble aus Wunstorf unter der
            Leitung von Christiane Kampe. Seit vielen Jahren prägt der Chor das
            kulturelle Leben der Region – mit sorgfältig erarbeiteten Programmen,
            klanglicher Feinheit und Freude am gemeinsamen Musizieren.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="mb-2 size-6 text-primary" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="leading-7">
                  {item.text}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Der Verein</CardTitle>
            <CardDescription>
              Eingetragen beim Amtsgericht Hannover unter VR 203208. Sitz:
              Wunstorf. Der mehrköpfige Vorstand verantwortet Organisation,
              Finanzen und die Freigabe neuer Mitgliederzugänge.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/sign-up">Mitglied werden</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Kontakt aufnehmen</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/history">Zur Geschichte</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
