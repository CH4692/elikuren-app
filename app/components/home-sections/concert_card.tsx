import { CalendarDays, Clock3, MapPin, Music4, Users } from "lucide-react";

export default function ConcertCard({
  concert_name,
  concert_info,
  concert_date,
  concert_time,
  concert_location,
  concert_street,
  concert_details_title,
  concert_details_info,
  concert_details_leader,
  concert_details_footer,
}: {
  concert_name: string;
  concert_info: string;
  concert_date: string;
  concert_time: string;
  concert_location: string;
  concert_street: string;
  concert_details_title: string;
  concert_details_info: string;
  concert_details_leader: string;
  concert_details_footer: string;
}) {
  return (
    <>
      <div className="max-w-3xl">
        <h1 className="text-4xl font-light leading-tight sm:text-5xl lg:text-7xl">
          {concert_name}
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">
          {concert_info}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
              <CalendarDays className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wide">Datum</span>
            </div>
            <p className="text-lg font-medium">{concert_date}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
              <Clock3 className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wide">Uhrzeit</span>
            </div>
            <p className="text-lg font-medium">{concert_time} Uhr</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm sm:col-span-2">
            <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
              <MapPin className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wide">Ort</span>
            </div>
            <p className="text-lg font-medium">{concert_location}</p>
            <p className="mt-1 text-sm text-white/75">{concert_street}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
        <div className="rounded-[1.5rem] bg-[#efe9de] p-6 text-[#173c34]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#b68a2b]">
            Konzertdetails
          </p>

          <h2 className="mt-3 text-3xl font-light">{concert_details_title}</h2>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <Music4 className="mt-1 min-h-5 min-w-5 text-[#b68a2b]" />
              <div>
                <p className="font-semibold">Programm</p>
                <p className="text-sm leading-6 text-[#173c34]/80">
                  {concert_details_info}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 min-h-5 min-w-5 text-[#b68a2b]" />
              <div>
                <p className="font-semibold">Leitung</p>
                <p className="text-sm leading-6 text-[#173c34]/80">
                  Musikalische Leitung: <b>{concert_details_leader}</b>
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
              {concert_details_footer}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
