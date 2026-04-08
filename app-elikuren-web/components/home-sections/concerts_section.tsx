import { CalendarDays, Clock3, MapPin, Music4, Users } from "lucide-react";
import Link from "next/link";

export default function ConcertPage() {
  return (
    <section
      id="concerts"
      className="min-h-screen pt-16 lg:p-8 w-full flex bg-second-primary justify-center items-center"
    >
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-6 py-24 lg:px-12">
        <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4aa43]">
              Nächstes Konzert
            </p>

            <h1 className="text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
              Herbstkonzert 2026
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">
              Der Kammerchor Elikuren und das musical team laden herzlich zu
              einem besonderen Konzert ein: Franz Schuberts „Winterreise“ in
              einer eindrucksvollen Chorfassung – als Uraufführung von Martin
              Kirchner, ehemaliger Professor für Neue Musik in Leipzig.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
                  <CalendarDays className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-wide">Datum</span>
                </div>
                <p className="text-lg font-medium">Sonntag, 11. Oktober 2026</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
                  <Clock3 className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-wide">
                    Uhrzeit
                  </span>
                </div>
                <p className="text-lg font-medium">15:00 Uhr</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm sm:col-span-2">
                <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-wide">Ort</span>
                </div>
                <p className="text-lg font-medium">
                  Kath. Pfarrkirche St. Bonifatius
                </p>
                <p className="mt-1 text-sm text-white/75">
                  Hindenburgstraße 17, 31515 Wunstorf
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="rounded-[1.5rem] bg-[#efe9de] p-6 text-[#173c34]">
              <p className="text-sm uppercase tracking-[0.2em] text-[#b68a2b]">
                Konzertdetails
              </p>

              <h2 className="mt-3 text-3xl font-light">Winterreise</h2>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-3">
                  <Music4 className="mt-1 min-h-5 min-w-5 text-[#b68a2b]" />
                  <div>
                    <p className="font-semibold">Programm</p>
                    <p className="text-sm leading-6 text-[#173c34]/80">
                      Franz Schuberts „Winterreise“ zählt zu den bedeutendsten
                      Liedzyklen der Musikgeschichte. In dieser
                      außergewöhnlichen Fassung für Chor, komponiert von{" "}
                      <span className="text-primary font-bold">
                        Martin Kirchner
                      </span>
                      , entfaltet das Werk eine neue klangliche Dimension.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="mt-1 min-h-5 min-w-5 text-[#b68a2b]" />
                  <div>
                    <p className="font-semibold">Leitung</p>
                    <p className="text-sm leading-6 text-[#173c34]/80">
                      Musikalische Leitung: <b>Christiane Kampe</b>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#d4aa43]/15 p-4">
                  <p className="text-sm font-semibold">Eintritt</p>
                  <p className="mt-1 text-sm text-[#173c34]/80">
                    Frei. Spenden erwünscht.
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[#173c34]/10 pt-5">
                <p className="text-sm leading-6 text-[#173c34]/75">
                  Ein Konzertabend für alle, die Chormusik in besonderer
                  Atmosphäre erleben möchten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
