import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isConcertVisibleViaPerformances,
  mirrorFieldsFromPerformance,
  pickMirrorPerformance,
  upcomingPerformances,
} from "../../lib/concert-performances";
import { parseBerlinDateTimeLocal } from "../../lib/datetime-berlin";

describe("isConcertVisibleViaPerformances", () => {
  const leipzig = {
    id: "p1",
    startsAt: parseBerlinDateTimeLocal("2026-09-27T17:00"),
    endsAt: null as Date | null,
    location: "HMT Leipzig",
    sortOrder: 0,
  };
  const wunstorf = {
    id: "p2",
    startsAt: parseBerlinDateTimeLocal("2026-10-11T17:00"),
    endsAt: null as Date | null,
    location: "St. Bonifatius",
    sortOrder: 1,
  };

  it("DRAFT is never visible even with performances", () => {
    assert.equal(
      isConcertVisibleViaPerformances({
        websiteStatus: "DRAFT",
        performances: [leipzig, wunstorf],
        now: parseBerlinDateTimeLocal("2026-09-01T12:00"),
      }),
      false,
    );
  });

  it("PUBLISHED is visible when any performance is still in window", () => {
    assert.equal(
      isConcertVisibleViaPerformances({
        websiteStatus: "PUBLISHED",
        performances: [leipzig, wunstorf],
        now: parseBerlinDateTimeLocal("2026-09-28T10:00"),
      }),
      true,
    );
  });

  it("PUBLISHED is hidden after the last performance window", () => {
    assert.equal(
      isConcertVisibleViaPerformances({
        websiteStatus: "PUBLISHED",
        performances: [leipzig, wunstorf],
        now: parseBerlinDateTimeLocal("2026-10-12T00:00"),
      }),
      false,
    );
  });

  it("PUBLISHED with no performances is hidden", () => {
    assert.equal(
      isConcertVisibleViaPerformances({
        websiteStatus: "PUBLISHED",
        performances: [],
        now: parseBerlinDateTimeLocal("2026-09-01T12:00"),
      }),
      false,
    );
  });
});

describe("pickMirrorPerformance / upcomingPerformances", () => {
  const leipzig = {
    id: "p1",
    startsAt: parseBerlinDateTimeLocal("2026-09-27T17:00"),
    endsAt: null as Date | null,
    location: "HMT Leipzig",
    address: "Grassistraße 8",
    sortOrder: 0,
  };
  const wunstorf = {
    id: "p2",
    startsAt: parseBerlinDateTimeLocal("2026-10-11T17:00"),
    endsAt: null as Date | null,
    location: "St. Bonifatius",
    address: "Wunstorf",
    sortOrder: 1,
  };

  it("mirrors the next still-visible performance", () => {
    const mirror = pickMirrorPerformance(
      [leipzig, wunstorf],
      parseBerlinDateTimeLocal("2026-09-28T10:00"),
    );
    assert.equal(mirror?.id, "p2");
    const fields = mirrorFieldsFromPerformance(mirror!);
    assert.equal(fields.location, "St. Bonifatius");
    assert.equal(fields.startsAt?.getTime(), wunstorf.startsAt.getTime());
  });

  it("falls back to the last performance when all are past", () => {
    const mirror = pickMirrorPerformance(
      [leipzig, wunstorf],
      parseBerlinDateTimeLocal("2026-10-12T12:00"),
    );
    assert.equal(mirror?.id, "p2");
  });

  it("upcomingPerformances hides past dates of a still-running concert", () => {
    const upcoming = upcomingPerformances(
      [leipzig, wunstorf],
      parseBerlinDateTimeLocal("2026-09-28T10:00"),
    );
    assert.equal(upcoming.length, 1);
    assert.equal(upcoming[0]?.id, "p2");
  });
});
