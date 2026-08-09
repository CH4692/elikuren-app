import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";

import { EmailSendError, sendEmail } from "../../lib/email/send-email";

const ORIGINAL = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
  EMAIL_REDIRECT_TO: process.env.EMAIL_REDIRECT_TO,
  EMAIL_AUTH_ALLOWED_RECIPIENTS: process.env.EMAIL_AUTH_ALLOWED_RECIPIENTS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

afterEach(() => {
  for (const [key, value] of Object.entries(ORIGINAL)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("sendEmail", () => {
  it("skips safely for re_test API keys", async () => {
    process.env.RESEND_API_KEY = "re_test_placeholder";
    const result = await sendEmail({
      to: "member@example.com",
      subject: "Test",
      kind: "magic-link",
      templateName: "magic-link",
      react: React.createElement("div", null, "hi"),
      text: "hi",
    });
    assert.deepEqual(result, {
      ok: true,
      status: "skipped",
      reason: "test_key",
    });
  });

  it("blocks non-allowlisted magic-link recipients outside production", async () => {
    process.env.RESEND_API_KEY = "re_live_fake";
    process.env.VERCEL_ENV = "preview";
    process.env.EMAIL_AUTH_ALLOWED_RECIPIENTS = "dev@example.com";
    delete process.env.EMAIL_REDIRECT_TO;

    await assert.rejects(
      () =>
        sendEmail({
          to: "member@example.com",
          subject: "Anmeldelink",
          kind: "magic-link",
          templateName: "magic-link",
          react: React.createElement("div", null, "hi"),
          text: "link",
        }),
      (error: unknown) =>
        error instanceof EmailSendError &&
        error.code === "recipient_not_allowed" &&
        !/token=/i.test(error.message),
    );
  });

  it("throws EmailSendError on missing API key instead of faking success", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.AUTH_RESEND_KEY;

    await assert.rejects(
      () =>
        sendEmail({
          to: "member@example.com",
          subject: "Anmeldelink",
          kind: "magic-link",
          templateName: "magic-link",
          react: React.createElement("div", null, "hi"),
          text: "link",
        }),
      (error: unknown) =>
        error instanceof EmailSendError && error.code === "not_configured",
    );
  });
});
