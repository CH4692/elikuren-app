import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  checkEmailAddress,
  isEmailFormatValid,
  suggestEmailAddress,
  suggestEmailDomain,
} from "../../lib/email-address";

describe("isEmailFormatValid", () => {
  it("accepts common addresses", () => {
    assert.equal(isEmailFormatValid("ada@example.com"), true);
    assert.equal(isEmailFormatValid("user.name+tag@gmx.de"), true);
  });

  it("rejects missing TLD dot and empty values", () => {
    assert.equal(isEmailFormatValid("ada@example"), false);
    assert.equal(isEmailFormatValid(""), false);
    assert.equal(isEmailFormatValid("not-an-email"), false);
    assert.equal(isEmailFormatValid("a@b..de"), false);
  });
});

describe("suggestEmailDomain", () => {
  it("suggests corrections for common typos", () => {
    assert.equal(suggestEmailDomain("gmial.com"), "gmail.com");
    assert.equal(suggestEmailDomain("gmx.ed"), "gmx.de");
    assert.equal(suggestEmailDomain("iclou.com"), "icloud.com");
  });

  it("returns null for known or unrelated domains", () => {
    assert.equal(suggestEmailDomain("gmail.com"), null);
    assert.equal(suggestEmailDomain("totally-unknown-domain.xyz"), null);
  });
});

describe("checkEmailAddress", () => {
  it("normalizes and validates", () => {
    const checked = checkEmailAddress("  Ada@Example.COM ");
    assert.equal(checked.ok, true);
    assert.equal(checked.normalized, "ada@example.com");
    assert.equal(checked.error, null);
    assert.equal(checked.suggestion, null);
  });

  it("keeps the Playwright contact error copy for invalid format", () => {
    const checked = checkEmailAddress("ada@example");
    assert.equal(checked.ok, false);
    assert.equal(checked.error, "Bitte eine gültige E-Mail-Adresse eingeben.");
    assert.equal(checked.suggestion, null);
  });

  it("suggests a full address without failing the check", () => {
    const checked = checkEmailAddress("chor@gmial.com");
    assert.equal(checked.ok, true);
    assert.equal(checked.suggestion, "chor@gmail.com");
    assert.equal(suggestEmailAddress("chor@gmial.com"), "chor@gmail.com");
  });
});
