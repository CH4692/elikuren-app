import { email_design } from "@/lib/email_design";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { firstName, lastName, email, subject, message } = body;

    await resend.emails.send({
      from: "Kammerchor Elikuren <admin@kammerchor-elikuren.de>",
      to: "kammerchor.elikuren@t-online.de",
      subject: subject || "Neue Kontaktanfrage",
      html: email_design(firstName, lastName, email, subject, message),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
