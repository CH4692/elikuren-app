import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isE2EEphemeralEmail,
  isE2EInvoiceNumber,
  isE2EMembershipMessage,
  sharedE2EFixtureEmails,
} from "../../lib/e2e-data-markers";

describe("e2e data markers", () => {
  it("detects ephemeral Playwright emails", () => {
    assert.equal(isE2EEphemeralEmail("pending-1@example.com"), true);
    assert.equal(isE2EEphemeralEmail("Ada@Example.COM"), true);
    assert.equal(
      isE2EEphemeralEmail("e2e-admin@kammerchor-elikuren.test"),
      false,
    );
    assert.equal(isE2EEphemeralEmail("member@kammerchor-elikuren.de"), false);
  });

  it("detects E2E invoice number prefixes", () => {
    assert.equal(isE2EInvoiceNumber("E2E-123"), true);
    assert.equal(isE2EInvoiceNumber("UI-123"), true);
    assert.equal(isE2EInvoiceNumber("INT-123"), true);
    assert.equal(isE2EInvoiceNumber("RO-123"), true);
    assert.equal(isE2EInvoiceNumber("EDIT-123"), true);
    assert.equal(isE2EInvoiceNumber("ARCH-123"), true);
    assert.equal(isE2EInvoiceNumber("FILE-123"), true);
    assert.equal(isE2EInvoiceNumber("INV-2026-001"), false);
  });

  it("detects Playwright membership messages", () => {
    assert.equal(
      isE2EMembershipMessage("Playwright Freigabe-Test"),
      true,
    );
    assert.equal(isE2EMembershipMessage("normale Anfrage"), false);
  });

  it("lists shared fixture emails with env overrides", () => {
    const emails = sharedE2EFixtureEmails({
      E2E_ADMIN_EMAIL: "Admin@Example.test",
      E2E_MEMBER_EMAIL: "member@example.test",
      E2E_AUDITOR_EMAIL: "auditor@example.test",
    });
    assert.deepEqual(emails, [
      "admin@example.test",
      "member@example.test",
      "auditor@example.test",
    ]);
  });
});
