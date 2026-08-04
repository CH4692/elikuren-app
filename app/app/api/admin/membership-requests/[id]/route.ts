import { NextResponse } from "next/server";

import {
  MembershipApprovedEmail,
  membershipApprovedEmailText,
} from "@/emails/membership-approved-email";
import { requirePermission } from "@/lib/authz";
import { emailLogoUrl, emailSiteUrl } from "@/lib/email/assets";
import { EmailSendError, sendEmail } from "@/lib/email/send-email";
import { reviewMembershipRequest } from "@/lib/membership-requests";
import { absoluteUrl } from "@/lib/site-url";

type Params = { params: Promise<{ id: string }> };

async function sendApprovalEmail(email: string): Promise<boolean> {
  const signInUrl = absoluteUrl("/auth/sign-in");
  try {
    const result = await sendEmail({
      to: email,
      subject: "Zugang freigeschaltet – Kammerchor Elikuren",
      kind: "transactional",
      templateName: "membership-approved",
      react: MembershipApprovedEmail({
        signInUrl,
        logoUrl: emailLogoUrl(),
        siteUrl: emailSiteUrl(),
      }),
      text: membershipApprovedEmailText({ signInUrl }),
    });
    return result.status === "sent";
  } catch (error) {
    console.error("[email]", {
      event: "membership_approved_send_failed",
      templateName: "membership-approved",
      code: error instanceof EmailSendError ? error.code : "unknown",
    });
    return false;
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("ACCESS_REQUEST_MANAGE");
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const body = (await request.json()) as {
    status?: "approved" | "rejected";
    voice?: string | null;
    adminNote?: string | null;
  };

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json(
      { detail: "Ungültiger Status", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const updated = await reviewMembershipRequest({
      id,
      status: body.status,
      reviewerId: gate.user.id,
      voice: body.voice,
      adminNote: body.adminNote,
    });

    if (!updated) {
      return NextResponse.json(
        { detail: "Anfrage nicht gefunden", code: "http_404" },
        { status: 404 },
      );
    }

    let approvalEmailSent = false;
    if (body.status === "approved") {
      // Freischaltung bleibt bestehen, auch wenn die Benachrichtigung fehlschlägt.
      approvalEmailSent = await sendApprovalEmail(updated.email);
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      approval_email_sent: approvalEmailSent,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_PENDING") {
      return NextResponse.json(
        { detail: "Anfrage wurde bereits bearbeitet", code: "NOT_PENDING" },
        { status: 409 },
      );
    }
    console.error("membership-request review failed", error);
    return NextResponse.json(
      { detail: "Aktualisierung fehlgeschlagen", code: "http_500" },
      { status: 500 },
    );
  }
}
