import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function FaqSection({
  title,
  items,
}: {
  title: string;
  items: FaqItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="mb-6 text-3xl font-semibold tracking-tight"
      >
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((faq) => (
          <Card key={faq.id}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
              <CardDescription className="leading-7">
                {faq.answer}
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </section>
  );
}
