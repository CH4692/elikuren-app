import { LucideProps, Music4, Sparkles, Users } from "lucide-react";

import { ForwardRefExoticComponent, ReactElement, RefAttributes } from "react";
import EnsembleContent, { EnsembleData } from "@/components/ensemble_content";

const ensemble: EnsembleData = {
  name: "musical team",
  eyebrow: "Ensemble",
  subtitle1: "Ein Ensemble mit Nähe, Ausdruck und eigener Farbe",
  subtitle2: "Was das musical team auszeichnet",
  claim:
    "Ein Frauen-Ensemble aus Wunstorf mit Freude an klangvoller Chormusik, stilistischer Vielfalt und lebendiger Bühnenpräsenz.",
  intro:
    "Das musical team ist ein Ensemble aus dem musikalischen Umfeld von Christiane Kampe in Wunstorf. In Konzerten tritt es gemeinsam mit anderen Ensembles und dem Kammerchor Elikuren auf und verbindet musikalische Präzision mit einer offenen, lebendigen Ausstrahlung.",
  story: [
    "Das Ensemble arbeitet in kleinerer Besetzung und gestaltet dadurch Programme mit besonderer Nähe, Transparenz und Flexibilität. Der Klang bleibt fein abgestimmt, zugleich entsteht eine unmittelbare Präsenz, die gerade in Konzerten eine besondere Wirkung entfalten kann.",
    "Öffentliche Konzertankündigungen zeigen eine stilistische Bandbreite: Neben romantischer Chormusik von Komponisten wie Mendelssohn, Brahms und Schumann stehen auch neuere Werke und populärere Titel auf dem Programm. Dadurch entsteht ein Repertoire, das musikalischen Anspruch mit Abwechslung und Lebendigkeit verbindet.",
    "Das musical team steht damit für gemeinsames Musizieren auf hohem Niveau, verbunden mit Ausdruck, Freude am Klang und einer besonderen Nähe zum Publikum.",
  ],
  profile: [
    {
      title: "Repertoire",
      text: "Von romantischer Chormusik bis zu neueren und populäreren Titeln – vielseitig, abwechslungsreich und publikumsnah.",
      icon: Music4,
    },
    {
      title: "Klang",
      text: "Die kleinere Besetzung ermöglicht Transparenz, feine Abstimmung und einen direkten, präsenten Ensembleklang.",
      icon: Sparkles,
    },
    {
      title: "Ensemblegeist",
      text: "Gemeinsame musikalische Arbeit, Verlässlichkeit und Freude am Auftritt prägen das Profil des musical team.",
      icon: Users,
    },
  ],
  highlights: [
    "Frauen-Ensemble",
    "Wunstorf",
    "Leitung: Christiane Kampe",
    "Stilistische Vielfalt",
  ],
  ctaTitle: "Interesse am musical team?",
  ctaText:
    "Wenn du mehr über das Ensemble erfahren, ein Konzert besuchen oder Kontakt aufnehmen möchtest, freuen wir uns über deine Nachricht.",
  images: [
    {
      src: "/musical_hero.jpeg",
      alt: "Das musical team bei einem Konzertauftritt",
    },
    {
      src: "/musical_gallery_1.jpg",
      alt: "Das musical team in Konzertatmosphäre",
    },
    {
      src: "/musical_gallery_2.jpg",
      alt: "Mitglieder des musical team beim gemeinsamen Musizieren",
    },
    {
      src: "/musical_gallery_3.jpg",
      alt: "Das musical team während eines Auftritts",
    },
  ],
};

export default function MusicalTeamPage() {
  return (
    <main className="bg-background text-foreground">
      <EnsembleContent ensemble={ensemble} />
    </main>
  );
}
