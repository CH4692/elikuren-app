import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatCents, parseEurosToCents } from "../../lib/money";

describe("money helpers", () => {
  it("formats cents as EUR in de-DE locale", () => {
    assert.match(formatCents(1250), /12,50/);
    assert.match(formatCents(1250), /€/);
  });

  it("parses comma and dot decimal strings to cents", () => {
    assert.equal(parseEurosToCents("12,50"), 1250);
    assert.equal(parseEurosToCents("12.50"), 1250);
    assert.equal(parseEurosToCents("0,5"), 50);
  });

  it("rejects invalid euro strings", () => {
    assert.equal(parseEurosToCents("abc"), null);
    assert.equal(parseEurosToCents("12,555"), null);
  });
});
