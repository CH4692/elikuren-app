import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Music4, Plane, ScrollText } from "lucide-react";

const historyEvents = [
  {
    year: "1990er",
    title: "Die Anfänge des Kammerchors Elikuren",
    text: "Die Geschichte des Kammerchors Elikuren ist geprägt von musikalischer Leidenschaft, gemeinsamer Entwicklung und vielen besonderen Begegnungen. Von den ersten Proben an stand die Freude an anspruchsvoller Chormusik und sorgfältiger Ensemblearbeit im Mittelpunkt.",
    images: [
      {
        src: "/images/history/history-1.jpg",
        alt: "Frühe Aufnahme des Kammerchors Elikuren",
      },
      {
        src: "/images/history/history-2.jpg",
        alt: "Historisches Bild des Kammerchors Elikuren",
      },
    ],
  },
  {
    year: "2000er",
    title: "Wachsende Konzerttätigkeit",
    text: "Mit den Jahren entwickelte sich der Chor musikalisch weiter und gestaltete regelmäßig Konzerte mit vielseitigen Programmen. Geistliche und weltliche Chormusik verschiedener Epochen prägten das Repertoire und formten das Profil des Ensembles.",
    images: [
      {
        src: "/images/history/history-3.jpg",
        alt: "Kammerchor Elikuren bei einem früheren Konzert",
      },
      {
        src: "/images/history/history-4.jpg",
        alt: "Choraufnahme aus einer früheren Konzertphase",
      },
    ],
  },
  {
    year: "2010er",
    title: "Besondere Programme und gemeinsame Erinnerungen",
    text: "Neben den Konzerten wurden auch Chorreisen, Begegnungen und gemeinsame Projekte zu wichtigen Bestandteilen des Chorlebens. Viele dieser Erlebnisse haben die Gemeinschaft gestärkt und die Geschichte des Chors nachhaltig geprägt.",
    images: [
      {
        src: "/images/history/history-5.jpg",
        alt: "Gemeinsame Reise oder Begegnung des Chors",
      },
      {
        src: "/images/history/history-6.jpg",
        alt: "Historische Aufnahme aus dem Chorleben",
      },
    ],
  },
  {
    year: "Heute",
    title: "Tradition und Weiterentwicklung",
    text: "Heute steht der Kammerchor Elikuren weiterhin für musikalischen Anspruch, klangliche Feinheit und lebendige Gemeinschaft. Die Geschichte des Chors lebt in seinen Konzerten, Erinnerungen und den Menschen weiter, die ihn über viele Jahre geprägt haben.",
    images: [
      {
        src: "/images/history/history-7.jpg",
        alt: "Kammerchor Elikuren in neuerer Zeit",
      },
      {
        src: "/images/history/history-8.jpg",
        alt: "Aktuelle Aufnahme des Kammerchors Elikuren",
      },
    ],
  },
];

const choirTrips = [
  {
    year: "2004",
    location: "Chorreise nach Italien",
    text: "Eine der prägenden Reisen des Chors führte nach Italien. Gemeinsame Konzerte, intensive Begegnungen und das Erleben neuer Orte machten diese Reise zu einem wichtigen Kapitel der Chorgeschichte.",
    images: [
      {
        src: "/images/history/trips/trip-1.jpg",
        alt: "Chorreise des Kammerchors Elikuren nach Italien",
      },
      {
        src: "/images/history/trips/trip-2.jpg",
        alt: "Gemeinsame Momente auf einer Chorreise",
      },
    ],
  },
  {
    year: "2012",
    location: "Begegnungsreise und Konzerttour",
    text: "Auch spätere Reisen verbanden musikalische Arbeit mit Gemeinschaft und kulturellen Eindrücken. Konzerte an besonderen Orten und die gemeinsame Zeit unterwegs bleiben bis heute in Erinnerung.",
    images: [
      {
        src: "/images/history/trips/trip-3.jpg",
        alt: "Konzertreise des Chors",
      },
      {
        src: "/images/history/trips/trip-4.jpg",
        alt: "Aufnahme von einer früheren Chorreise",
      },
    ],
  },
  {
    year: "Weitere Reisen",
    location: "Viele gemeinsame musikalische Wege",
    text: "Über die Jahre hinweg haben zahlreiche Reisen das Chorleben bereichert. Sie stehen für Gemeinschaft, musikalische Offenheit und die Freude daran, Musik auch außerhalb des gewohnten Rahmens miteinander zu erleben.",
    images: [
      {
        src: "/images/history/trips/trip-5.jpg",
        alt: "Historische Impression einer Chorreise",
      },
      {
        src: "/images/history/trips/trip-6.jpg",
        alt: "Erinnerungsbild einer Reise des Kammerchors Elikuren",
      },
    ],
  },
];

export default function HistoryPage() {
  return (
    <main className="bg-background text-foreground mt-24">
      <section className="relative overflow-hidden bg-second-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/history/hero.jpg"
            alt="Historische Aufnahme des Kammerchors Elikuren"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#1F1F23]/70" />
        </div>

        <div className="relative mx-auto flex min-h-[75svh] max-w-7xl items-center px-6 py-24 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#C8A24D]">
              Geschichte
            </p>

            <h1 className="text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
              Die Geschichte des Kammerchors Elikuren
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              Die Entwicklung des Kammerchors Elikuren ist geprägt von
              musikalischer Leidenschaft, langjähriger Gemeinschaft, besonderen
              Konzerten und vielen gemeinsamen Reisen. Diese Seite lädt dazu
              ein, zurückzublicken auf wichtige Stationen, Erinnerungen und
              Bilder aus der Geschichte des Chors.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/home#concerts"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Aktuelle Konzerte
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Über den Chor
                <ScrollText className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary">
              Rückblick
            </p>

            <h2 className="mt-4 text-3xl font-light sm:text-4xl">
              Erinnerungen, Entwicklung und gemeinsame Wege
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Über viele Jahre hinweg ist aus gemeinsamen Proben,
                Konzertvorbereitungen und Begegnungen eine lebendige
                Chorgeschichte entstanden. Sie erzählt nicht nur von
                musikalischen Programmen, sondern auch von Freundschaften,
                Reisen, besonderen Orten und der Freude am gemeinsamen Singen.
              </p>
              <p>
                Die folgenden Stationen geben einen Einblick in die Entwicklung
                des Kammerchors Elikuren und zeigen mit Bildern und Texten, wie
                sich das Ensemble im Laufe der Zeit geprägt und verändert hat.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] shadow-xl">
            <Image
              src="/images/history/intro.jpg"
              alt="Historisches Gruppenbild des Kammerchors Elikuren"
              width={1200}
              height={900}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-primary">
              Zeitstrahl
            </p>

            <h2 className="mt-4 text-3xl font-light sm:text-4xl">
              Wichtige Stationen der Chorgeschichte
            </h2>
          </div>

          <div className="mt-14 space-y-16">
            {historyEvents.map((event, index) => (
              <article
                key={`${event.year}-${event.title}`}
                className="grid gap-8 lg:grid-cols-[180px_1fr]"
              >
                <div className="relative">
                  <div className="sticky top-24">
                    <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      {event.year}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:p-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Music4 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium">{event.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                        {event.text}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {event.images.map((image) => (
                      <div
                        key={image.src}
                        className="overflow-hidden rounded-[1.5rem]"
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={1000}
                          height={750}
                          className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.25em] text-primary">
            Chorreisen
          </p>

          <h2 className="mt-4 text-3xl font-light sm:text-4xl">
            Gemeinsame Reisen und musikalische Begegnungen
          </h2>

          <p className="mt-6 text-base leading-8 text-muted-foreground">
            Chorreisen gehören zu den besonders prägenden Erfahrungen des
            Ensemblelebens. Sie verbinden Musik, Gemeinschaft und kulturelle
            Eindrücke und schaffen Erinnerungen, die weit über einzelne Konzerte
            hinausreichen.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          {choirTrips.map((trip, index) => (
            <article
              key={`${trip.year}-${trip.location}`}
              className="grid gap-8 rounded-[2rem] border border-border bg-background p-6 shadow-sm lg:grid-cols-[1fr_1.1fr] lg:p-8"
            >
              <div
                className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}
              >
                <div className="flex items-center gap-3 text-primary">
                  <Plane className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-[0.2em]">
                    {trip.year}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-medium">{trip.location}</h3>

                <div className="mt-4 flex items-start gap-3 text-muted-foreground">
                  <MapPin className="mt-1 h-4 w-4 min-w-4 text-[#C8A24D]" />
                  <p className="text-sm leading-7 sm:text-base">{trip.text}</p>
                </div>
              </div>

              <div
                className={
                  index % 2 === 0
                    ? "order-2 grid gap-6 sm:grid-cols-2"
                    : "order-2 grid gap-6 sm:grid-cols-2 lg:order-1"
                }
              >
                {trip.images.map((image) => (
                  <div
                    key={image.src}
                    className="overflow-hidden rounded-[1.5rem]"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={1000}
                      height={750}
                      className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-second-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-sm lg:p-10">
            <p className="text-sm uppercase tracking-[0.25em] text-[#C8A24D]">
              Heute
            </p>

            <h2 className="mt-4 text-3xl font-light sm:text-4xl">
              Die Geschichte geht weiter
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-white/80">
              Die Geschichte des Kammerchors Elikuren lebt in jedem neuen
              Konzert, in jeder Probe und in jeder Begegnung weiter. Vergangene
              Jahre, Reisen und Programme prägen das Ensemble bis heute – und
              bilden die Grundlage für alles, was noch kommt.
            </p>

            <div className="mt-8">
              <Link
                href="/home#joinus"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Kontakt aufnehmen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
