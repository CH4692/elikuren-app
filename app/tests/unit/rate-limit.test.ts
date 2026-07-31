import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allowMagicLinkRequest,
  allowMembershipRequest,
  checkRateLimit,
  clientIpFromHeaders,
} from "../../lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the window limit", () => {
    const key = `test-${Date.now()}-allowed`;
    assert.equal(checkRateLimit(key, 2, 60_000).allowed, true);
    assert.equal(checkRateLimit(key, 2, 60_000).allowed, true);
  });

  it("blocks after the limit is exceeded", () => {
    const key = `test-${Date.now()}-blocked`;
    assert.equal(checkRateLimit(key, 1, 60_000).allowed, true);
    assert.equal(checkRateLimit(key, 1, 60_000).allowed, false);
  });
});

describe("clientIpFromHeaders", () => {
  it("reads the first x-forwarded-for address", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.1, 198.51.100.2",
    });
    assert.equal(clientIpFromHeaders(headers), "203.0.113.1");
  });

  it("falls back to x-real-ip or unknown", () => {
    assert.equal(
      clientIpFromHeaders(new Headers({ "x-real-ip": "10.0.0.5" })),
      "10.0.0.5",
    );
    assert.equal(clientIpFromHeaders(new Headers()), "unknown");
  });
});

describe("allowMagicLinkRequest", () => {
  it("uses separate buckets for email and ip", () => {
    const suffix = Date.now();
    const email = `magic-${suffix}@example.com`;
    const ip = `127.0.0.${suffix % 200 + 1}`;
    assert.equal(allowMagicLinkRequest(email, ip), true);
  });
});

describe("allowMembershipRequest", () => {
  it("allows first membership request for email and ip", () => {
    const suffix = Date.now();
    assert.equal(
      allowMembershipRequest(`member-${suffix}@example.com`, `10.1.0.${suffix % 200 + 1}`),
      true,
    );
  });
});
