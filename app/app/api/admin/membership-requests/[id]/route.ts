import { NextResponse } from "next/server";

import { Resend } from "resend";

import { requirePermission } from "@/lib/authz";
import { reviewMembershipRequest } from "@/lib/membership-requests";

type Params = { params: Promise<{ id: string }> };

async function sendApprovalEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_test")) return false;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://kammerchor-elikuren.de";
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@kammerchor-elikuren.de",
    to: email,
    subject: "Zugang freigeschaltet – Kammerchor Elikuren",
    html: `<p>Dein Zugang zum Mitgliederbereich des Kammerchors Elikuren wurde freigeschaltet.</p>
<p>Bitte melde dich an und fordere dort deinen Magic Link an:</p>
<p><a href="${siteUrl}/auth/sign-in">${siteUrl}/auth/sign-in</a></p>`,
  });
  return true;
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
      try {
        approvalEmailSent = await sendApprovalEmail(updated.email);
      } catch {
        approvalEmailSent = false;
      }
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
