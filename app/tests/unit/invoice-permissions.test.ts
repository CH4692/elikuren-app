import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hasPermission } from "../../lib/permissions";

describe("Invoice permissions matrix", () => {
  it("mitglied has no invoice permissions", () => {
    assert.equal(hasPermission("mitglied", "INVOICE_READ"), false);
    assert.equal(hasPermission("mitglied", "INVOICE_WRITE"), false);
    assert.equal(hasPermission("mitglied", "PAYMENT_RECORD"), false);
  });

  it("kassenpruefer is read-only", () => {
    assert.equal(hasPermission("kassenpruefer", "INVOICE_READ"), true);
    assert.equal(hasPermission("kassenpruefer", "INVOICE_WRITE"), false);
    assert.equal(hasPermission("kassenpruefer", "PAYMENT_RECORD"), false);
  });

  it("vorstand and kassenwart can write and record payment", () => {
    for (const role of ["vorstand", "kassenwart"] as const) {
      assert.equal(hasPermission(role, "INVOICE_READ"), true);
      assert.equal(hasPermission(role, "INVOICE_WRITE"), true);
      assert.equal(hasPermission(role, "PAYMENT_RECORD"), true);
    }
  });
});
