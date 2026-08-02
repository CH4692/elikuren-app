import { endOfDayEuropeBerlin } from "@/lib/datetime-berlin";

export function concertVisibleUntil(input: {
  startsAt: Date;
  endsAt: Date | null;
}): Date {
  return input.endsAt ?? endOfDayEuropeBerlin(input.startsAt);
}

export function isConcertPubliclyVisible(
  input: {
    showOnWebsite: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  },
  now = new Date(),
): boolean {
  if (!input.showOnWebsite || !input.startsAt) return false;
  return (
    now.getTime() <=
    concertVisibleUntil({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    }).getTime()
  );
}
