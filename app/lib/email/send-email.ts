import type { ReactElement } from "react";
import { Resend } from "resend";

import { getEmailFromHeader } from "@/lib/email/brand";
import {
  isMagicLinkRecipientAllowed,
  resolveOutboundRecipient,
  type EmailKind,
} from "@/lib/email/policy";

export type { EmailKind };

export type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
  text: string;
  replyTo?: string;
  kind: EmailKind;
  templateName: string;
};

export type SendEmailResult =
  | { ok: true; status: "sent"; id: string }
  | {
      ok: true;
      status: "skipped";
      reason: "test_key";
    };

export class EmailSendError extends Error {
  readonly code:
    | "not_configured"
    | "recipient_not_allowed"
    | "provider_error";

  constructor(
    code: EmailSendError["code"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "EmailSendError";
    this.code = code;
  }
}

function getResendApiKey(): string {
  return (
    process.env.RESEND_API_KEY?.trim() ||
    process.env.AUTH_RESEND_KEY?.trim() ||
    ""
  );
}

function isTestApiKey(apiKey: string): boolean {
  return apiKey.startsWith("re_test");
}

/** Safe log fields only — never magic-link URLs or tokens. */
function logEmailEvent(
  level: "info" | "error",
  event: string,
  fields: Record<string, string | boolean | undefined>,
) {
  const payload = { event, ...fields };
  if (level === "error") {
    console.error("[email]", payload);
  } else {
    console.info("[email]", payload);
  }
}

/**
 * Central Resend send helper.
 * - transactional: may redirect via EMAIL_REDIRECT_TO
 * - magic-link: never redirected; non-prod allowlist; test key skips safely
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new EmailSendError(
      "not_configured",
      "RESEND_API_KEY (or AUTH_RESEND_KEY) is not configured",
    );
  }

  if (isTestApiKey(apiKey)) {
    logEmailEvent("info", "email_skipped_test_key", {
      templateName: input.templateName,
      kind: input.kind,
    });
    return { ok: true, status: "skipped", reason: "test_key" };
  }

  const resolved = resolveOutboundRecipient({
    to: input.to,
    kind: input.kind,
    redirectTo: process.env.EMAIL_REDIRECT_TO,
  });

  if (!resolved.to) {
    throw new EmailSendError("provider_error", "Missing email recipient");
  }

  if (resolved.redirected) {
    logEmailEvent("info", "email_redirected", {
      templateName: input.templateName,
      kind: input.kind,
      redirected: true,
    });
  }

  if (input.kind === "magic-link") {
    if (!isMagicLinkRecipientAllowed(resolved.to)) {
      logEmailEvent("error", "magic_link_recipient_blocked", {
        templateName: input.templateName,
        kind: input.kind,
        recipientAllowed: false,
      });
      throw new EmailSendError(
        "recipient_not_allowed",
        "Magic-link email blocked: recipient is not in the configured EMAIL_AUTH_ALLOWED_RECIPIENTS allowlist.",
      );
    }
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: getEmailFromHeader(),
    to: resolved.to,
    subject: input.subject,
    react: input.react,
    text: input.text,
    replyTo: input.replyTo,
  });

  if (error) {
    logEmailEvent("error", "email_provider_error", {
      templateName: input.templateName,
      kind: input.kind,
      providerMessage: error.message,
    });
    throw new EmailSendError(
      "provider_error",
      `Resend error: ${error.message}`,
      { cause: error },
    );
  }

  const id = data?.id ?? "unknown";
  logEmailEvent("info", "email_sent", {
    templateName: input.templateName,
    kind: input.kind,
    id,
  });

  return { ok: true, status: "sent", id };
}
