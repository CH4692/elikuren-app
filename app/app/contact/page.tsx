import Link from "next/link";
import { Mail, MapPin, Music4, Send } from "lucide-react";
import ContactForm from "@/components/form/contact-form";
import FormContent from "@/components/form/form-content";

export default function ContactPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="bg-second-primary text-white mt-24">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
            Kontakt
          </p>

          <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
            Schreib uns!
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Ob Konzertanfrage, Interesse am Mitsingen oder allgemeine Fragen zum
            Verein – melde dich gerne bei uns. Wir freuen uns über deine
            Nachricht.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid gap-8 items-center lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-secondary/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-2xl font-medium">E-Mail</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Für allgemeine Anfragen, Konzertanfragen oder Informationen zum
                Mitsingen.
              </p>

              <a
                href="mailto:kammerchor.elikuren@t-online.de"
                className="mt-4 inline-block text-primary underline underline-offset-4"
              >
                kammerchor.elikuren@t-online.de
              </a>
            </div>

            <div className="rounded-[2rem] border border-border bg-secondary/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-2xl font-medium">Ort</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Kammerchor Elikuren e. V.
                <br />
                Wunstorf
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-secondary/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Music4 className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-2xl font-medium">Mitsingen</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Du hast Interesse, bei einem unserer Ensembles mitzusingen?
                Schreib uns gern ein paar Sätze über dich und deine musikalische
                Erfahrung.
              </p>

              <Link
                href="/home#joinus"
                className="mt-4 inline-flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/5"
              >
                Mehr erfahren
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">
                  Nachricht senden
                </p>
                <h2 className="mt-1 text-2xl font-medium">Kontaktformular</h2>
              </div>
            </div>

            <ContactForm>
              <FormContent />
            </ContactForm>
          </div>
        </div>
      </section>
    </main>
  );
}
