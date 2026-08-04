import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isMagicLinkRecipientAllowed,
  logPayloadLooksSafe,
  resolveOutboundRecipient,
} from "../../lib/email/policy";

describe("resolveOutboundRecipient", () => {
  it("redirects transactional mail when configured", () => {
    const result = resolveOutboundRecipient({
      to: "choir@example.com",
      kind: "transactional",
      redirectTo: "dev@example.com",
    });
    assert.equal(result.to, "dev@example.com");
    assert.equal(result.redirected, true);
  });

  it("never redirects magic-link mail", () => {
    const result = resolveOutboundRecipient({
      to: "member@example.com",
      kind: "magic-link",
      redirectTo: "dev@example.com",
    });
    assert.equal(result.to, "member@example.com");
    assert.equal(result.redirected, false);
  });
});

describe("isMagicLinkRecipientAllowed", () => {
  it("allows all recipients in production", () => {
    assert.equal(
      isMagicLinkRecipientAllowed("anyone@example.com", "", true),
      true,
    );
  });

  it("allows all recipients outside production when allowlist is unset", () => {
    assert.equal(
      isMagicLinkRecipientAllowed("member@example.com", undefined, false),
      true,
    );
    assert.equal(
      isMagicLinkRecipientAllowed("member@example.com", "  ", false),
      true,
    );
  });

  it("blocks non-allowlisted recipients when allowlist is set", () => {
    assert.equal(
      isMagicLinkRecipientAllowed(
        "member@example.com",
        "dev@example.com,qa@example.com",
        false,
      ),
      false,
    );
  });

  it("allows allowlisted recipients outside production", () => {
    assert.equal(
      isMagicLinkRecipientAllowed(
        "Dev@Example.com",
        "dev@example.com,qa@example.com",
        false,
      ),
      true,
    );
  });
});

describe("logPayloadLooksSafe", () => {
  it("rejects payloads that contain magic-link tokens or callback URLs", () => {
    assert.equal(
      logPayloadLooksSafe({
        url: "https://example.com/api/auth/callback/resend?token=abc",
      }),
      false,
    );
    assert.equal(
      logPayloadLooksSafe({ note: "token=secret-value" }),
      false,
    );
    assert.equal(
      logPayloadLooksSafe({
        event: "email_sent",
        templateName: "magic-link",
        id: "re_123",
      }),
      true,
    );
  });
});
