import { Music4, Sparkles, Users } from "lucide-react";
import EnsembleContent, { EnsembleData } from "@/components/ensemble_content";

const ensemble: EnsembleData = {
  name: "Kammerchor Elikuren",
  eyebrow: "Ensemble",
  subtitle1:
    "Ein Chor mit musikalischem Anspruch und klarer künstlerischer Handschrift",
  subtitle2: "Was den Kammerchor Elikuren auszeichnet",
  claim:
    "Anspruchsvolle Chormusik aus Wunstorf – mit klanglicher Tiefe, stilistischer Vielfalt und Freude am gemeinsamen Musizieren.",
  intro:
    "Der Kammerchor Elikuren ist ein Vokalensemble aus Wunstorf unter der Leitung von Christiane Kampe. Das Ensemble gestaltet regelmäßig Konzerte mit sorgfältig erarbeiteten Programmen und verbindet musikalische Präzision mit einer offenen, lebendigen Chorgemeinschaft.",
  story: [
    "Im Mittelpunkt der Arbeit steht die intensive Auseinandersetzung mit anspruchsvoller Chorliteratur. Der Chor widmet sich geistlicher und weltlicher Musik verschiedener Epochen und sucht in seinen Programmen immer wieder nach klanglicher Vielfalt, Ausdruck und inhaltlicher Tiefe.",
    "Dabei entstehen Konzertformate, die Bekanntes und Neues miteinander verbinden. Neben romantischer Chormusik und klassischem Repertoire finden auch moderne Werke, besondere Arrangements und thematisch gestaltete Programme ihren Platz.",
    "Was Elikuren auszeichnet, ist die Verbindung aus musikalischem Anspruch und gemeinschaftlichem Musizieren: konzentrierte Probenarbeit, Freude an feinen Klangfarben und das Ziel, Konzerte mit Atmosphäre und Ausstrahlung zu gestalten.",
  ],
  profile: [
    {
      title: "Repertoire",
      text: "Geistliche und weltliche Chormusik verschiedener Epochen – von romantischer Literatur bis zu modernen und thematisch gestalteten Programmen.",
      icon: Music4,
    },
    {
      title: "Klangarbeit",
      text: "Präzision, Balance, Ausdruck und ein gemeinsamer Ensembleklang stehen im Zentrum der Probenarbeit.",
      icon: Sparkles,
    },
    {
      title: "Gemeinschaft",
      text: "Ein engagierter Chor, der musikalischen Anspruch mit Offenheit, Verlässlichkeit und gemeinsamer Entwicklung verbindet.",
      icon: Users,
    },
  ],
  highlights: [
    "Wunstorf",
    "Leitung: Christiane Kampe",
    "Anspruchsvolle Chorliteratur",
    "Thematische Konzertprogramme",
  ],
  ctaTitle: "Interesse am Kammerchor Elikuren?",
  ctaText:
    "Wer Freude an anspruchsvoller Chormusik, konzentrierter Probenarbeit und lebendigem Ensembleklang hat, ist herzlich eingeladen, Kontakt mit uns aufzunehmen.",
  images: [
    {
      src: "/elikuren_hero.jpg",
      alt: "Kammerchor Elikuren bei einem Konzert",
    },
    {
      src: "/elikuren_gallery_1.jpg",
      alt: "Kammerchor Elikuren in Konzertatmosphäre",
    },
    {
      src: "/elikuren_gallery_2.jpg",
      alt: "Chormitglieder des Kammerchors Elikuren",
    },
    {
      src: "/elikuren_gallery_3.jpg",
      alt: "Kammerchor Elikuren während einer Aufführung",
    },
  ],
};

export default function ElikurenPage() {
  return (
    <main className="bg-background text-foreground">
      <EnsembleContent ensemble={ensemble} />
    </main>
  );
}
