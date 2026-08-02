const BERLIN = "Europe/Berlin";

function berlinYmd(date: Date): { y: string; m: string; d: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BERLIN,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) {
    throw new Error("Could not format date in Europe/Berlin");
  }
  return { y, m, d };
}

function berlinHour(date: Date): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: BERLIN,
    hour: "numeric",
    hourCycle: "h23",
  }).format(date);
  return Number(hour);
}

/**
 * End of the calendar day of `date` in Europe/Berlin (23:59:59.999 local).
 * DST-aware (CET +01 / CEST +02).
 */
export function endOfDayEuropeBerlin(date: Date): Date {
  const { y, m, d } = berlinYmd(date);
  const day = `${y}-${m}-${d}`;
  // CET (+01) and CEST (+02) candidates; keep the one still on that Berlin day at 23:xx.
  for (const offset of ["+02:00", "+01:00"] as const) {
    const candidate = new Date(`${day}T23:59:59.999${offset}`);
    if (
      Number.isFinite(candidate.getTime()) &&
      berlinYmd(candidate).y === y &&
      berlinYmd(candidate).m === m &&
      berlinYmd(candidate).d === d &&
      berlinHour(candidate) === 23
    ) {
      return candidate;
    }
  }
  return new Date(`${day}T23:59:59.999+02:00`);
}

/**
 * Public visibility window end: explicit endsAt, else end of Berlin calendar day of startsAt.
 */
export function concertVisibleUntil(
  startsAt: Date,
  endsAt: Date | null,
): Date {
  return endsAt ?? endOfDayEuropeBerlin(startsAt);
}

/** Revive dates after JSON/cache round-trips (ISO strings → Date). */
export function asDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

/** Calendar date (UTC midnight) for the Berlin day of an instant — legacy Concert.date. */
export function berlinCalendarDateUtc(date: Date): Date {
  const { y, m, d } = berlinYmd(date);
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

export function formatBerlinDateTimeLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BERLIN,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * Parse admin datetime-local as Europe/Berlin wall time.
 * Input: `YYYY-MM-DDTHH:mm` (no timezone).
 */
export function parseBerlinDateTimeLocal(value: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    throw new Error("Ungültige Datum/Uhrzeit");
  }
  const day = trimmed.slice(0, 10);
  const time = trimmed.slice(11);
  for (const offset of ["+02:00", "+01:00"] as const) {
    const candidate = new Date(`${day}T${time}:00${offset}`);
    if (!Number.isFinite(candidate.getTime())) continue;
    if (formatBerlinDateTimeLocal(candidate) === trimmed) {
      return candidate;
    }
  }
  throw new Error("Ungültige Datum/Uhrzeit (Europe/Berlin)");
}
