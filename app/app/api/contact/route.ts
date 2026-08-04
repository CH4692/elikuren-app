import { NextResponse } from "next/server";

import {
  ContactInquiryEmail,
  contactInquiryEmailText,
} from "@/emails/contact-inquiry-email";
import { emailLogoUrl, emailSiteUrl } from "@/lib/email/assets";
import { getContactEmailTo } from "@/lib/email/brand";
import { EmailSendError, sendEmail } from "@/lib/email/send-email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { firstName, lastName, email, subject, message } = body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json({ error: "Fehler beim Senden" }, { status: 400 });
    }

    const result = await sendEmail({
      to: getContactEmailTo(),
      replyTo: email.trim(),
      subject: subject?.trim() || "Neue Kontaktanfrage",
      kind: "transactional",
      templateName: "contact-inquiry",
      react: ContactInquiryEmail({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        subject: subject?.trim() || "",
        message: String(message),
        logoUrl: emailLogoUrl(),
        siteUrl: emailSiteUrl(),
      }),
      text: contactInquiryEmailText({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        subject: subject?.trim() || "",
        message: String(message),
      }),
    });

    if (result.status === "skipped") {
      // Test keys must not look like successful delivery to end users.
      return NextResponse.json({ error: "Fehler beim Senden" }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (!(error instanceof EmailSendError)) {
      console.error("[email]", {
        event: "contact_send_failed",
        templateName: "contact-inquiry",
      });
    }
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
