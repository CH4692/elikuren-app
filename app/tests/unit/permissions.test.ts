import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hasPermission,
  permissionsForRole,
} from "../../lib/permissions";
import {
  canAccessScopedFile,
  validateUploadInput,
} from "../../lib/files";

describe("Permission matrix V1", () => {
  it("mitglied has no invoice access", () => {
    assert.equal(hasPermission("mitglied", "INVOICE_READ"), false);
    assert.equal(hasPermission("mitglied", "INVOICE_WRITE"), false);
    assert.equal(hasPermission("mitglied", "PAYMENT_RECORD"), false);
  });

  it("vorstand and kassenwart can write invoices and record payments", () => {
    for (const role of ["vorstand", "kassenwart"] as const) {
      assert.equal(hasPermission(role, "INVOICE_READ"), true);
      assert.equal(hasPermission(role, "INVOICE_WRITE"), true);
      assert.equal(hasPermission(role, "PAYMENT_RECORD"), true);
    }
  });

  it("kassenpruefer is invoice read-only", () => {
    assert.equal(hasPermission("kassenpruefer", "INVOICE_READ"), true);
    assert.equal(hasPermission("kassenpruefer", "INVOICE_WRITE"), false);
    assert.equal(hasPermission("kassenpruefer", "PAYMENT_RECORD"), false);
  });

  it("mitglied baseline content permissions", () => {
    const perms = permissionsForRole("mitglied");
    assert.ok(perms.includes("MEMBER_CONTENT_READ"));
    assert.ok(perms.includes("PROFILE_WRITE_SELF"));
    assert.equal(perms.includes("PIECE_MANAGE"), false);
  });

  it("vorstand can read audit", () => {
    assert.equal(hasPermission("vorstand", "AUDIT_READ"), true);
  });

  it("mitglied and kassenwart cannot read audit", () => {
    for (const role of ["mitglied", "kassenwart", "kassenpruefer"] as const) {
      assert.equal(hasPermission(role, "AUDIT_READ"), false);
    }
  });
});

describe("File accessScope", () => {
  it("ALL_MEMBERS allows any member role", () => {
    assert.equal(
      canAccessScopedFile({
        accessScope: "ALL_MEMBERS",
        fileVoiceGroup: "SOPRANO",
        userRole: "mitglied",
        userVoice: "Bass",
      }),
      true,
    );
  });

  it("VOICE_GROUP_ONLY restricts to matching voice unless admin", () => {
    assert.equal(
      canAccessScopedFile({
        accessScope: "VOICE_GROUP_ONLY",
        fileVoiceGroup: "TENOR",
        userRole: "mitglied",
        userVoice: "Bass",
      }),
      false,
    );
    assert.equal(
      canAccessScopedFile({
        accessScope: "VOICE_GROUP_ONLY",
        fileVoiceGroup: "TENOR",
        userRole: "mitglied",
        userVoice: "Tenor",
      }),
      true,
    );
    assert.equal(
      canAccessScopedFile({
        accessScope: "VOICE_GROUP_ONLY",
        fileVoiceGroup: "TENOR",
        userRole: "vorstand",
        userVoice: "Bass",
      }),
      true,
    );
  });

  it("ADMIN_ONLY requires PIECE_MANAGE", () => {
    assert.equal(
      canAccessScopedFile({
        accessScope: "ADMIN_ONLY",
        fileVoiceGroup: null,
        userRole: "mitglied",
        userVoice: "Sopran",
      }),
      false,
    );
    assert.equal(
      canAccessScopedFile({
        accessScope: "ADMIN_ONLY",
        fileVoiceGroup: null,
        userRole: "vorstand",
        userVoice: null,
      }),
      true,
    );
  });
});

describe("Upload validation", () => {
  it("accepts pdf sheet within size", () => {
    const result = validateUploadInput({
      category: "SHEET",
      originalName: "partitur.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
    });
    assert.equal(result.ok, true);
  });

  it("rejects wrong mime for sheet", () => {
    const result = validateUploadInput({
      category: "SHEET",
      originalName: "partitur.pdf",
      mimeType: "image/png",
      sizeBytes: 1024,
    });
    assert.equal(result.ok, false);
  });
});
