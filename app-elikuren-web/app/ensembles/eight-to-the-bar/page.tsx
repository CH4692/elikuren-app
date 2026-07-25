import { Music4, Sparkles, Users } from "lucide-react";
import EnsembleContent, { EnsembleData } from "@/components/ensemble_content";

const ensemble: EnsembleData = {
  name: "Eight to the Bar",
  eyebrow: "Ensemble",
  subtitle1: "Ein Ensemble mit Nähe, Präzision und eigener Farbe",
  subtitle2: "Was Eight to the Bar auszeichnet",
  claim:
    "Ein kleines Ensemble mit klarem Profil, musikalischer Präsenz und Freude an stilistischer Vielfalt.",
  intro:
    "Eight to the Bar ist ein Ensemble, das musikalische Energie, präzises Zusammenspiel und lebendige Bühnenpräsenz miteinander verbindet. Im kleineren Format entstehen Programme mit Nähe zum Publikum, besonderer klanglicher Transparenz und einem eigenen Charakter.",
  story: [
    "Im Mittelpunkt steht das gemeinsame Musizieren in einer konzentrierten, flexiblen Besetzung. Dadurch entsteht ein Klangbild, das direkt, beweglich und ausdrucksstark wirkt – mit Raum für feine Abstimmung, Rhythmusgefühl und musikalische Persönlichkeit.",
    "Das Ensemble widmet sich stilistisch vielseitigen Programmen und bringt Musik mit Leichtigkeit, Präsenz und klarer Form auf die Bühne. Gerade die kleinere Besetzung macht es möglich, unmittelbarer zu gestalten und musikalische Details besonders hörbar werden zu lassen.",
    "Eight to the Bar steht damit für ein Format, das Qualität und Lebendigkeit verbindet: aufmerksam gearbeitet, publikumsnah präsentiert und getragen von echter Freude am gemeinsamen Auftritt.",
  ],
  profile: [
    {
      title: "Klang",
      text: "Transparent, direkt und fein abgestimmt – ein Ensembleklang, der auch in kleiner Besetzung viel Ausdruck entfalten kann.",
      icon: Music4,
    },
    {
      title: "Charakter",
      text: "Lebendig, präsent und nah am Publikum – mit spürbarer Energie und einem klaren musikalischen Profil.",
      icon: Sparkles,
    },
    {
      title: "Zusammenspiel",
      text: "Die kleinere Besetzung ermöglicht besondere Aufmerksamkeit, Flexibilität und ein intensives gemeinsames Musizieren.",
      icon: Users,
    },
  ],
  highlights: [
    "Kleine Besetzung",
    "Präsenter Ensembleklang",
    "Stilistische Vielfalt",
    "Publikumsnahes Format",
  ],
  ctaTitle: "Interesse an Eight to the Bar?",
  ctaText:
    "Wenn du mehr über das Ensemble erfahren, ein Konzert besuchen oder Kontakt aufnehmen möchtest, freuen wir uns über deine Nachricht.",
  images: [
    {
      src: "/eight-hero.jpg",
      alt: "Eight to the Bar bei einem Auftritt",
    },
    {
      src: "/eight_gallery_1.jpg",
      alt: "Ensemble Eight to the Bar in Konzertatmosphäre",
    },
    {
      src: "/eight_gallery_2.jpg",
      alt: "Mitglieder von Eight to the Bar beim Musizieren",
    },
    {
      src: "/eight_gallery_3.jpg",
      alt: "Eight to the Bar während eines Auftritts",
    },
  ],
};

export default function EightToTheBarPage() {
  return (
    <main className="bg-background text-foreground">
      <EnsembleContent ensemble={ensemble} />
    </main>
  );
}
