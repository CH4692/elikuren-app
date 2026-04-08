import Link from "next/link";

export default function ImpressumPage() {
  return (
    <section className="min-h-[100svh] bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-light">Impressum</h1>

        <div className="space-y-4 text-base leading-7 text-foreground/80">
          <p>
            <strong>Angaben gemäß § 5 TMG</strong>
          </p>

          <p>
            Kammerchor Elikuren e.V.
            <br />
            Habichthorst 2a
            <br />
            31315 Wunstorf
            <br />
            Deutschland
          </p>

          <p>
            <strong>Vertreten durch:</strong>
            <br />
            Agnes Christiane Kampe (Vorstand)
            <br />
            Niklas Pruschinski (Vorstand)
            <br />
            Charles Heller (Vorstand)
            <br />
            Marc Alexender Kiel (Vorstand)
          </p>

          <p>
            <strong>Kontakt</strong>
            <br />
            E-Mail:{" "}
            <Link href="mailto:kammerchor-elikuren@t-online.de">
              kammerchor-elikuren@t-online.de
            </Link>
          </p>

          <p>
            <strong>Registereintrag</strong>
            <br />
            Registernummer: VR 203208
          </p>

          <p>
            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 MStV</strong>
            <br />
            Charles Heller
            <br />
            Immengarten 9
            <br />
            31134 Hildesheim
          </p>

          <p>
            <strong>Haftung für Inhalte</strong>
            <br />
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>

          <p>
            <strong>Haftung für Links</strong>
            <br />
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich.
          </p>

          <p>
            <strong>Urheberrecht</strong>
            <br />
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge
            Dritter sind als solche gekennzeichnet. Die Vervielfältigung,
            Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
            jeweiligen Autors bzw. Erstellers.
          </p>
        </div>
      </div>
    </section>
  );
}
