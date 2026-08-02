import {
  formatPublicConcertDate,
  formatPublicConcertTime,
  listPublicConcerts,
} from "@/lib/concerts-public";
import { getSectionDataPublic } from "@/lib/site-content";

import ConcertCard from "./concert_card";

export default async function ConcertPage() {
  const intro = await getSectionDataPublic<{
    eyebrow: string;
    emptyMessage: string;
  }>("home", "concerts_intro");
  const concerts = await listPublicConcerts();

  return (
    <section
      id="concerts"
      className="min-h-screen pt-16 lg:p-8 w-full flex bg-second-primary justify-center items-center"
    >
      <div className="relative mx-auto flex flex-col min-h-[100svh] max-w-7xl items-center px-6 py-24 lg:px-12">
        <div className="w-full">
          <p className="mb-4 text-sm uppercase justify-start tracking-[0.3em] text-[#d4aa43]">
            {intro?.eyebrow ?? "Konzerte"}
          </p>
        </div>
        {concerts.length === 0 ? (
          <p className="w-full text-[#5c574e]">
            {intro?.emptyMessage ??
              "Aktuell sind keine öffentlichen Konzerte geplant."}
          </p>
        ) : (
          <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {concerts.map((concert) => (
              <ConcertCard
                key={concert.id}
                concert_name={concert.title}
                concert_info={concert.description ?? ""}
                concert_date={formatPublicConcertDate(concert.startsAt)}
                concert_time={formatPublicConcertTime(concert.startsAt)}
                concert_location={concert.location ?? ""}
                concert_street={concert.address ?? ""}
                concert_details_title={concert.subtitle ?? concert.title}
                concert_details_info={concert.extraInfo ?? ""}
                concert_details_leader=""
                concert_details_footer={
                  concert.ticketUrl
                    ? `Tickets: ${concert.ticketUrl}`
                    : ""
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
