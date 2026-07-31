import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeEmail } from "../../lib/permissions";
import { PENDING_APPROVAL_MESSAGE } from "../helpers/credentials";

describe("membership neutral messaging", () => {
  it("pending approval copy does not reveal whether an email is registered", () => {
    const message =
      "Falls dein Zugang bereits freigegeben wurde, erhältst du in Kürze einen Anmeldelink. Andernfalls wirst du informiert, sobald ein Administrator deinen Zugang freigegeben hat.";
    assert.match(message, PENDING_APPROVAL_MESSAGE);
    assert.doesNotMatch(message, /nicht registriert|unbekannt|existiert nicht/i);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases emails", () => {
    assert.equal(normalizeEmail("  User@Example.COM  "), "user@example.com");
  });
});
