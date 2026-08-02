import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  endOfDayEuropeBerlin,
  formatBerlinDateTimeLocal,
  parseBerlinDateTimeLocal,
} from "../../lib/datetime-berlin";
import { isConcertPubliclyVisible } from "../../lib/concert-visibility";

describe("Europe/Berlin datetime helpers", () => {
  it("parses and formats wall time round-trip for CEST", () => {
    const parsed = parseBerlinDateTimeLocal("2026-10-11T17:00");
    assert.equal(formatBerlinDateTimeLocal(parsed), "2026-10-11T17:00");
  });

  it("endOfDay stays on the same Berlin calendar day", () => {
    const start = parseBerlinDateTimeLocal("2026-10-11T17:00");
    const end = endOfDayEuropeBerlin(start);
    assert.equal(formatBerlinDateTimeLocal(end).startsWith("2026-10-11T23:"), true);
  });
});

describe("public concert visibility", () => {
  it("keeps concert visible after start until end of Berlin day", () => {
    const startsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");
    const during = parseBerlinDateTimeLocal("2026-10-11T20:00");
    assert.equal(
      isConcertPubliclyVisible(
        { showOnWebsite: true, startsAt, endsAt: null },
        during,
      ),
      true,
    );
  });

  it("hides concert after Berlin day ends when endsAt missing", () => {
    const startsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");
    const nextMorning = parseBerlinDateTimeLocal("2026-10-12T00:30");
    assert.equal(
      isConcertPubliclyVisible(
        { showOnWebsite: true, startsAt, endsAt: null },
        nextMorning,
      ),
      false,
    );
  });

  it("requires startsAt for showOnWebsite visibility", () => {
    assert.equal(
      isConcertPubliclyVisible(
        { showOnWebsite: true, startsAt: null, endsAt: null },
        new Date(),
      ),
      false,
    );
  });
});
