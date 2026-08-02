import { NextResponse } from "next/server";

import { createMembershipRequest, pendingApprovalMessage } from "@/lib/membership-requests";
import {
  allowMembershipRequest,
  clientIpFromHeaders,
} from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/authz";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      firstname?: string;
      lastname?: string;
      message?: string;
      voice?: string;
    };

    if (!body.email) {
      return NextResponse.json(
        { detail: "E-Mail ist erforderlich", code: "validation_error" },
        { status: 400 },
      );
    }

    const email = normalizeEmail(body.email);
    const ip = clientIpFromHeaders(request.headers);

    if (!allowMembershipRequest(email, ip)) {
      return NextResponse.json(
        {
          ok: true,
          message: "Bitte versuche es später erneut.",
        },
        { status: 200 },
      );
    }

    await createMembershipRequest({
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      message: body.message,
      voice: body.voice,
    });

    // Always the same success shape — no email enumeration.
    return NextResponse.json(
      {
        ok: true,
        message: pendingApprovalMessage(),
      },
      { status: 200 },
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "INVALID_EMAIL") {
      return NextResponse.json(
        { detail: "Bitte eine gültige E-Mail-Adresse eingeben.", code },
        { status: 400 },
      );
    }
    console.error("membership-request create failed", error);
    return NextResponse.json(
      { detail: "Anfrage konnte nicht gespeichert werden", code: "http_500" },
      { status: 500 },
    );
  }
}
