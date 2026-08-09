import { CalendarDays, Clock3, MapPin, Music4, Users } from "lucide-react";

export type ConcertCardPerformance = {
  date: string;
  time: string;
  location: string;
  street: string;
  label?: string | null;
};

export default function ConcertCard({
  concert_name,
  concert_info,
  performances,
  concert_details_title,
  concert_details_info,
  concert_details_leader,
  concert_details_footer,
  concert_admission,
}: {
  concert_name: string;
  concert_info: string;
  performances: ConcertCardPerformance[];
  concert_details_title: string;
  concert_details_info: string;
  concert_details_leader: string;
  concert_details_footer: string;
  concert_admission: string | null;
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

        <div className="mt-10 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-[#d4aa43]">
            {performances.length > 1 ? "Termine" : "Termin"}
          </p>
          {performances.map((performance, index) => (
            <div
              key={`${performance.date}-${performance.time}-${performance.location}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
            >
              {performance.label ? (
                <p className="mb-3 text-sm font-medium text-[#d4aa43]">
                  {performance.label}
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
                    <CalendarDays className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-wide">
                      Datum
                    </span>
                  </div>
                  <p className="text-lg font-medium">{performance.date}</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
                    <Clock3 className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-wide">
                      Uhrzeit
                    </span>
                  </div>
                  <p className="text-lg font-medium">
                    {performance.time} Uhr
                  </p>
                </div>
                {(performance.location || performance.street) && (
                  <div className="sm:col-span-2">
                    <div className="mb-2 flex items-center gap-3 text-[#d4aa43]">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-wide">
                        Ort
                      </span>
                    </div>
                    {performance.location ? (
                      <p className="text-lg font-medium">
                        {performance.location}
                      </p>
                    ) : null}
                    {performance.street ? (
                      <p className="mt-1 text-sm text-white/75">
                        {performance.street}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
        <div className="rounded-[1.5rem] bg-[#efe9de] p-6 text-[#173c34]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#b68a2b]">
            Konzertdetails
          </p>

          <h2 className="mt-3 text-3xl font-light">{concert_details_title}</h2>

          <div className="mt-8 space-y-5">
            {concert_details_info ? (
              <div className="flex items-start gap-3">
                <Music4 className="mt-1 min-h-5 min-w-5 text-[#b68a2b]" />
                <div>
                  <p className="font-semibold">Programm</p>
                  <p className="text-sm leading-6 text-[#173c34]/80">
                    {concert_details_info}
                  </p>
                </div>
              </div>
            ) : null}

            {concert_details_leader ? (
              <div className="flex items-start gap-3">
                <Users className="mt-1 min-h-5 min-w-5 text-[#b68a2b]" />
                <div>
                  <p className="font-semibold">Leitung</p>
                  <p className="text-sm leading-6 text-[#173c34]/80">
                    Musikalische Leitung: <b>{concert_details_leader}</b>
                  </p>
                </div>
              </div>
            ) : null}

            {concert_admission ? (
              <div className="rounded-2xl bg-[#d4aa43]/15 p-4">
                <p className="text-sm font-semibold">Eintritt</p>
                <p className="mt-1 text-sm text-[#173c34]/80">
                  {concert_admission}
                </p>
              </div>
            ) : null}
          </div>

          {concert_details_footer ? (
            <div className="mt-8 border-t border-[#173c34]/10 pt-5">
              <p className="text-sm leading-6 text-[#173c34]/75">
                {concert_details_footer}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
