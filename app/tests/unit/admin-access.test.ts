import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hasAdminAreaAccess,
  hasPermission,
} from "../../lib/permissions";

describe("admin area access", () => {
  it("grants admin area access to roles with management permissions", () => {
    assert.equal(hasAdminAreaAccess("vorstand"), true);
    assert.equal(hasAdminAreaAccess("kassenwart"), true);
    assert.equal(hasAdminAreaAccess("kassenpruefer"), true);
  });

  it("denies admin area access to regular members", () => {
    assert.equal(hasAdminAreaAccess("mitglied"), false);
  });

  it("requires ACCESS_REQUEST_MANAGE for membership review", () => {
    assert.equal(hasPermission("vorstand", "ACCESS_REQUEST_MANAGE"), true);
    assert.equal(hasPermission("mitglied", "ACCESS_REQUEST_MANAGE"), false);
  });
});
