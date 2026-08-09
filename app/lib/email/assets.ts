import { readFileSync } from "node:fs";
import { join } from "node:path";

import { absoluteUrl } from "@/lib/site-url";

/** Content-ID for Resend inline logo (avoids Preview SSO blocking remote images). */
export const EMAIL_LOGO_CONTENT_ID = "elikuren-logo";

/** Use in HTML <img src> when sending via Resend with the matching attachment. */
export function emailLogoUrl(): string {
  return `cid:${EMAIL_LOGO_CONTENT_ID}`;
}

export function emailSiteUrl(): string {
  return absoluteUrl("/");
}

/** Absolute https URL — useful for local React Email preview only. */
export function emailLogoPreviewUrl(): string {
  return absoluteUrl("/email/logo.png");
}

export function emailLogoAttachment(): {
  content: string;
  filename: string;
  contentId: string;
  contentType: string;
} {
  const logoPath = join(process.cwd(), "public/email/logo.png");
  const content = readFileSync(logoPath).toString("base64");
  return {
    content,
    filename: "logo.png",
    contentId: EMAIL_LOGO_CONTENT_ID,
    contentType: "image/png",
  };
}
