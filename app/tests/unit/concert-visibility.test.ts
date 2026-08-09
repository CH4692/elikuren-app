import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getConcertWebsiteBadge,
  isConcertVisible,
} from "../../lib/concert-visibility";
import { parseBerlinDateTimeLocal } from "../../lib/datetime-berlin";

describe("isConcertVisible", () => {
  const startsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");
  const visibleUntil = parseBerlinDateTimeLocal("2026-10-11T23:59");

  it("DRAFT is never visible", () => {
    assert.equal(
      isConcertVisible({
        websiteStatus: "DRAFT",
        startsAt,
        visibleUntil,
        now: startsAt,
      }),
      false,
    );
  });

  it("PUBLISHED without startsAt is never visible", () => {
    assert.equal(
      isConcertVisible({
        websiteStatus: "PUBLISHED",
        startsAt: null,
        visibleUntil,
        now: startsAt,
      }),
      false,
    );
  });

  it("PUBLISHED without visibleUntil is never visible", () => {
    assert.equal(
      isConcertVisible({
        websiteStatus: "PUBLISHED",
        startsAt,
        visibleUntil: null,
        now: startsAt,
      }),
      false,
    );
  });

  it("is visible before and exactly at visibleUntil", () => {
    assert.equal(
      isConcertVisible({
        websiteStatus: "PUBLISHED",
        startsAt,
        visibleUntil,
        now: parseBerlinDateTimeLocal("2026-10-11T20:00"),
      }),
      true,
    );
    assert.equal(
      isConcertVisible({
        websiteStatus: "PUBLISHED",
        startsAt,
        visibleUntil,
        now: visibleUntil,
      }),
      true,
    );
  });

  it("is not visible after visibleUntil", () => {
    assert.equal(
      isConcertVisible({
        websiteStatus: "PUBLISHED",
        startsAt,
        visibleUntil,
        now: parseBerlinDateTimeLocal("2026-10-12T00:00"),
      }),
      false,
    );
  });
});

describe("getConcertWebsiteBadge", () => {
  const startsAt = parseBerlinDateTimeLocal("2026-10-11T17:00");
  const visibleUntil = parseBerlinDateTimeLocal("2026-10-11T23:59");

  it("labels DRAFT as Entwurf", () => {
    const badge = getConcertWebsiteBadge({
      websiteStatus: "DRAFT",
      startsAt,
      visibleUntil,
      now: startsAt,
    });
    assert.equal(badge.kind, "draft");
    assert.equal(badge.label, "Entwurf");
  });

  it("labels live PUBLISHED as Veröffentlicht", () => {
    const badge = getConcertWebsiteBadge({
      websiteStatus: "PUBLISHED",
      startsAt,
      visibleUntil,
      now: startsAt,
    });
    assert.equal(badge.kind, "published");
    assert.equal(badge.label, "Veröffentlicht");
  });

  it("labels expired PUBLISHED as bereits vorbei", () => {
    const badge = getConcertWebsiteBadge({
      websiteStatus: "PUBLISHED",
      startsAt,
      visibleUntil,
      now: parseBerlinDateTimeLocal("2026-10-12T01:00"),
    });
    assert.equal(badge.kind, "published_past");
    assert.equal(badge.label, "Veröffentlicht – bereits vorbei");
  });

  it("labels incomplete PUBLISHED as unvollständig", () => {
    const badge = getConcertWebsiteBadge({
      websiteStatus: "PUBLISHED",
      startsAt: null,
      visibleUntil: null,
      now: startsAt,
    });
    assert.equal(badge.kind, "published_incomplete");
    assert.equal(badge.label, "Veröffentlicht – unvollständig");
  });
});
