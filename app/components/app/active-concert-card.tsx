import { Calendar, MapPin, Music2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export type ActiveConcertSummary = {
  title: string;
  date: string | null;
  year: number | null;
  location: string | null;
};

function formatConcertDate(date: string | null) {
  if (!date) return null;
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function ConcertDateLocation({
  date,
  location,
}: {
  date: string | null;
  location: string | null;
}) {
  const formatted = formatConcertDate(date);
  if (!formatted && !location) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[#3f3a34]">
      {formatted ? (
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5 shrink-0 text-[#C8A24D]" aria-hidden />
          <span>{formatted}</span>
        </span>
      ) : null}
      {formatted && location ? (
        <span className="text-[#c4bbaa]" aria-hidden>
          •
        </span>
      ) : null}
      {location ? (
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0 text-[#C8A24D]" aria-hidden />
          <span>{location}</span>
        </span>
      ) : null}
    </p>
  );
}

type ActiveConcertCardProps = {
  concert: ActiveConcertSummary | null;
  loading?: boolean;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ActiveConcertCard({
  concert,
  loading = false,
  description = "Dieses Konzert wird aktuell für Programme, Noten und Audiodateien verwendet.",
  emptyTitle = "Kein aktives Konzert",
  emptyDescription = "Aktuell wurde kein Konzert festgelegt. Der Gesamtkatalog steht weiterhin zur Verfügung.",
}: ActiveConcertCardProps) {
  return (
    <section className="rounded-2xl border border-[#d9d2c4] bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Music2 className="size-5 text-[#C8A24D]" aria-hidden />
        <h2 className="font-heading text-lg font-semibold text-[#1f1f23]">
          Aktuelles Konzert
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3 rounded-xl border border-[#ebe4d8] bg-[#f7f4ee] px-4 py-4 sm:px-5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      ) : concert ? (
        <div className="rounded-xl border border-[#C8A24D]/40 bg-[#C8A24D]/10 px-4 py-4 sm:px-5">
          <div className="min-w-0 space-y-2">
            <p className="font-heading text-2xl font-semibold text-[#1f1f23]">
              {concert.title}
            </p>
            <ConcertDateLocation
              date={concert.date}
              location={concert.location}
            />
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <Badge variant="success">Aktiv</Badge>
              {concert.year ? (
                <Badge
                  variant="default"
                  className="rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums"
                >
                  {concert.year}
                </Badge>
              ) : null}
            </div>
            <p className="max-w-xl text-sm text-[#5c574e]">{description}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d9d2c4] bg-[#f7f4ee] px-4 py-4 sm:px-5">
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-[#1f1f23]">{emptyTitle}</p>
            <p className="max-w-xl text-sm text-[#5c574e]">{emptyDescription}</p>
          </div>
        </div>
      )}
    </section>
  );
}
