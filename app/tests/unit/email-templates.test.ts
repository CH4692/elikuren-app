import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@react-email/render";

import {
  ContactInquiryEmail,
  contactInquiryEmailText,
} from "../../emails/contact-inquiry-email";
import {
  MagicLinkEmail,
  magicLinkEmailText,
} from "../../emails/magic-link-email";
import {
  MembershipApprovedEmail,
  membershipApprovedEmailText,
} from "../../emails/membership-approved-email";
import { EMAIL_LOGO_CONTENT_ID } from "../../lib/email/assets";

const LOGO = `cid:${EMAIL_LOGO_CONTENT_ID}`;
const SITE = "https://example.com";
const LOGIN =
  "https://example.com/api/auth/callback/resend?callbackUrl=%2Fdashboard&token=secret-token&email=a%40b.de";

function hrefOccurrences(html: string, url: string): number {
  const encoded = url.replace(/&/g, "&amp;");
  const plainCount = html.split(`href="${url}"`).length - 1;
  const encodedCount = html.split(`href="${encoded}"`).length - 1;
  return Math.max(plainCount, encodedCount);
}

describe("email templates", () => {
  it("magic link renders polished CTA without exposing raw token URL text", async () => {
    const html = await render(
      MagicLinkEmail({
        loginUrl: LOGIN,
        logoUrl: LOGO,
        siteUrl: SITE,
      }),
    );
    assert.match(html, /Jetzt anmelden/);
    assert.match(html, /Kammerchor Elikuren/);
    assert.match(html, /Link im Browser öffnen/);
    assert.ok(hrefOccurrences(html, LOGIN) >= 2);
    assert.match(html, new RegExp(`src="cid:${EMAIL_LOGO_CONTENT_ID}"`));
    assert.doesNotMatch(html, /src="\/email\//);
    // Visible body should not dump the raw token URL as link text.
    assert.doesNotMatch(html, />https:\/\/example\.com\/api\/auth\/callback/);

    const text = magicLinkEmailText({ loginUrl: LOGIN });
    assert.match(text, /Mitgliederbereich/);
    assert.ok(text.includes(LOGIN));
  });

  it("membership approved uses sign-in URL and matching CTA", async () => {
    const signInUrl = "https://example.com/auth/sign-in";
    const html = await render(
      MembershipApprovedEmail({
        signInUrl,
        logoUrl: LOGO,
        siteUrl: SITE,
      }),
    );
    assert.match(html, /Jetzt anmelden/);
    assert.match(html, /href="https:\/\/example\.com\/auth\/sign-in"/);
    assert.match(html, /Link im Browser öffnen/);
    const text = membershipApprovedEmailText({ signInUrl });
    assert.match(text, /sign-in/);
  });

  it("contact inquiry escapes HTML in user input and keeps plaintext", async () => {
    const html = await render(
      ContactInquiryEmail({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        subject: "Probe",
        message: '<script>alert("x")</script>\nZeile 2',
        logoUrl: LOGO,
        siteUrl: SITE,
      }),
    );
    assert.doesNotMatch(html, /<script>alert/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /Zeile 2/);
    assert.match(html, new RegExp(`src="cid:${EMAIL_LOGO_CONTENT_ID}"`));

    const text = contactInquiryEmailText({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      subject: "Probe",
      message: "Hallo",
    });
    assert.match(text, /ada@example.com/);
    assert.match(text, /Hallo/);
  });
});
