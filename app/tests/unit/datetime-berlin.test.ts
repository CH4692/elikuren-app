import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  asDate,
  concertVisibleUntil,
  endOfDayEuropeBerlin,
  formatBerlinDateTimeLocal,
  parseBerlinDateTimeLocal,
} from "../../lib/datetime-berlin";

describe("Europe/Berlin datetime helpers", () => {
  it("parses and formats wall time round-trip for CEST", () => {
    const parsed = parseBerlinDateTimeLocal("2026-10-11T17:00");
    assert.equal(formatBerlinDateTimeLocal(parsed), "2026-10-11T17:00");
  });

  it("parses and formats wall time round-trip for CET", () => {
    const parsed = parseBerlinDateTimeLocal("2026-01-15T17:00");
    assert.equal(formatBerlinDateTimeLocal(parsed), "2026-01-15T17:00");
  });
});

describe("endOfDayEuropeBerlin", () => {
  it("returns 23:59 Berlin on a CEST day", () => {
    const start = parseBerlinDateTimeLocal("2026-07-15T17:00");
    const end = endOfDayEuropeBerlin(start);
    assert.equal(formatBerlinDateTimeLocal(end), "2026-07-15T23:59");
    // CEST = UTC+2 → 21:59:59.999Z
    assert.equal(end.toISOString(), "2026-07-15T21:59:59.999Z");
  });

  it("returns 23:59 Berlin on a CET day", () => {
    const start = parseBerlinDateTimeLocal("2026-01-15T17:00");
    const end = endOfDayEuropeBerlin(start);
    assert.equal(formatBerlinDateTimeLocal(end), "2026-01-15T23:59");
    // CET = UTC+1 → 22:59:59.999Z
    assert.equal(end.toISOString(), "2026-01-15T22:59:59.999Z");
  });

  it("handles spring DST transition day (2026-03-29)", () => {
    // Clocks jump 02:00 → 03:00; end of day is still 23:59 CEST.
    const start = parseBerlinDateTimeLocal("2026-03-29T12:00");
    const end = endOfDayEuropeBerlin(start);
    assert.equal(formatBerlinDateTimeLocal(end), "2026-03-29T23:59");
    assert.equal(end.toISOString(), "2026-03-29T21:59:59.999Z");
  });

  it("handles autumn DST transition day (2026-10-25)", () => {
    // Clocks fall back 03:00 → 02:00; end of day is 23:59 CET.
    const start = parseBerlinDateTimeLocal("2026-10-25T12:00");
    const end = endOfDayEuropeBerlin(start);
    assert.equal(formatBerlinDateTimeLocal(end), "2026-10-25T23:59");
    assert.equal(end.toISOString(), "2026-10-25T22:59:59.999Z");
  });
});

describe("asDate (cache rehydration)", () => {
  it("revives ISO strings from unstable_cache JSON", () => {
    const revived = asDate("2026-10-11T15:00:00.000Z");
    assert.ok(revived instanceof Date);
    assert.equal(revived?.toISOString(), "2026-10-11T15:00:00.000Z");
  });

  it("returns null for invalid values", () => {
    assert.equal(asDate("not-a-date"), null);
    assert.equal(asDate(null), null);
    assert.equal(asDate(new Date("invalid")), null);
  });
});

describe("concertVisibleUntil", () => {
  it("uses endsAt unchanged when provided", () => {
    const startsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");
    const endsAt = parseBerlinDateTimeLocal("2026-10-11T19:30");
    const until = concertVisibleUntil(startsAt, endsAt);
    assert.equal(until.getTime(), endsAt.getTime());
  });

  it("falls back to end of Berlin calendar day without endsAt", () => {
    const startsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");
    const until = concertVisibleUntil(startsAt, null);
    assert.equal(until.getTime(), endOfDayEuropeBerlin(startsAt).getTime());
    assert.equal(formatBerlinDateTimeLocal(until), "2026-10-11T23:59");
  });

  it("respects CEST when computing day end without endsAt", () => {
    const startsAt = parseBerlinDateTimeLocal("2026-07-15T17:00");
    const until = concertVisibleUntil(startsAt, null);
    assert.equal(until.toISOString(), "2026-07-15T21:59:59.999Z");
  });

  it("respects CET when computing day end without endsAt", () => {
    const startsAt = parseBerlinDateTimeLocal("2026-01-15T17:00");
    const until = concertVisibleUntil(startsAt, null);
    assert.equal(until.toISOString(), "2026-01-15T22:59:59.999Z");
  });
});
