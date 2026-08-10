import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateSiteLink } from "../../lib/site-content/links";

describe("validateSiteLink", () => {
  it("allows known internal routes", () => {
    assert.equal(validateSiteLink("/home").ok, true);
    assert.equal(validateSiteLink("/about").ok, true);
    assert.equal(validateSiteLink("/ensembles/elikuren").ok, true);
  });

  it("allows known anchors", () => {
    assert.equal(validateSiteLink("/home#concerts").ok, true);
    assert.equal(validateSiteLink("/home#joinus").ok, true);
  });

  it("allows https external URLs", () => {
    assert.equal(
      validateSiteLink("https://www.instagram.com/kammerchor.elikuren/").ok,
      true,
    );
  });

  it("rejects http and unsafe schemes", () => {
    assert.equal(validateSiteLink("http://example.com").ok, false);
    assert.equal(validateSiteLink("javascript:alert(1)").ok, false);
    assert.equal(validateSiteLink("data:text/html,hi").ok, false);
    assert.equal(validateSiteLink("ftp://example.com").ok, false);
  });

  it("rejects unknown internal routes and anchors", () => {
    assert.equal(validateSiteLink("/unknown").ok, false);
    assert.equal(validateSiteLink("/home#missing").ok, false);
  });

  it("allows mailto only when enabled", () => {
    assert.equal(validateSiteLink("mailto:a@b.de").ok, false);
    assert.equal(
      validateSiteLink("mailto:a@b.de", { allowMailto: true }).ok,
      true,
    );
  });
});
