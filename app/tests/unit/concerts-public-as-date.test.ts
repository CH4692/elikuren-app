import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { asDate } from "../../lib/concerts-public";

describe("asDate (cache rehydration)", () => {
  it("revives ISO strings from unstable_cache JSON", () => {
    const revived = asDate("2026-10-11T15:00:00.000Z");
    assert.ok(revived instanceof Date);
    assert.equal(revived?.toISOString(), "2026-10-11T15:00:00.000Z");
  });

  it("keeps valid Date instances", () => {
    const original = new Date("2026-01-15T16:00:00.000Z");
    const revived = asDate(original);
    assert.equal(revived?.getTime(), original.getTime());
  });

  it("returns null for invalid values", () => {
    assert.equal(asDate("not-a-date"), null);
    assert.equal(asDate(null), null);
    assert.equal(asDate(undefined), null);
    assert.equal(asDate(new Date("invalid")), null);
  });
});
