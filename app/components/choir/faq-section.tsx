import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const faqs = [
  {
    q: "Brauch ich Chorerfahrung?",
    a: "Erste Chorerfahrung oder sicheres Notenlesen helfen – entscheidend sind Interesse, Verlässlichkeit und Freude am gemeinsamen Klang.",
  },
  {
    q: "Wie werde ich Mitglied?",
    a: "Über „Mitglied werden“ stellst du eine Anfrage. Der Vorstand prüft sie und schaltet dich danach für den Magic-Link-Login frei.",
  },
  {
    q: "Welche Ensembles gibt es?",
    a: "Den Kammerchor Elikuren sowie kleinere Formationen wie eight to the bar und das musical team – je nach Stimme und Interesse.",
  },
  {
    q: "Wo finde ich Konzerttermine?",
    a: "Aktuelle Konzerte stehen auf der Startseite unter „Konzerte“. Zusätzlich informieren wir über unsere Kanäle und vor Ort.",
  },
];

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-6 text-3xl font-semibold tracking-tight">
        Häufige Fragen
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.q}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.q}</CardTitle>
              <CardDescription className="leading-7">{faq.a}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </section>
  );
}
