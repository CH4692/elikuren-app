import { CalendarDays, Clock3, MapPin, Music4, Users } from "lucide-react";
import ConcertCard from "./concert_card";

type ConcertType = {
  concert_info: string;
  concert_name: string;
  concert_date: string;
  concert_time: string;
  concert_location: string;
  concert_street: string;
  concert_details_title: string;
  concert_details_info: string;
  concert_details_leader: string;
  concert_details_footer: string;
};

const concerts: ConcertType[] = [
  {
    concert_name: "HerbstKonzert 2026",
    concert_info:
      'Der Kammerchor Elikuren und das musical team laden herzlich zu einem besonderen Konzert ein: Franz Schuberts "Winterreise" in einer eindrucksvollen Chorfassung - als Uraufführung von von Martin Kürschner, ehemaliger Rektor der Hochschule für Musik und Theater Leipzig und aktuell Professor für Komposition und Musiktheorie.',
    concert_date: "Sonntag, 11. Oktober 2026",
    concert_time: "17:00",
    concert_location: "Kath. Pfarrkirche St. Bonifatius",
    concert_street: "Hindenburgstraße 17, 31515 Wunstorf",
    concert_details_title: "Winterreise",
    concert_details_info:
      'Franz Schuberts "Winterreise" zählt zu den bedeutenstenn Liedzyklen der Musikgeschichte. In dieser außergewähnlichen Fassung für Chor, komponiert von Martin Kürschner entfaltet das Werk eine neue klangliche Dimension.',
    concert_details_leader: "Christiane Kampe",
    concert_details_footer:
      "Ein Konzertabend für alle, die Chormusik erleben möchten.",
  },
];

export default function ConcertPage() {
  return (
    <section
      id="concerts"
      className="min-h-screen pt-16 lg:p-8 w-full flex bg-second-primary justify-center items-center"
    >
      <div className="relative mx-auto flex flex-col min-h-[100svh] max-w-7xl items-center px-6 py-24 lg:px-12">
        <div className="w-full">
          <p className="mb-4 text-sm uppercase justify-start tracking-[0.3em] text-[#d4aa43]">
            Konzerte
          </p>
        </div>
        <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {concerts.map((concert, index) => (
            <ConcertCard
              key={index}
              concert_name={concert.concert_name}
              concert_info={concert.concert_info}
              concert_date={concert.concert_date}
              concert_time={concert.concert_time}
              concert_location={concert.concert_location}
              concert_street={concert.concert_street}
              concert_details_title={concert.concert_details_title}
              concert_details_info={concert.concert_details_info}
              concert_details_leader={concert.concert_details_leader}
              concert_details_footer={concert.concert_details_footer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
