import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { deleteUser, upsertUserFromClerkWebhook } from "@/lib/users";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: number;
    updated_at?: number;
    primary_email_address_id?: string | null;
    primary_phone_number_id?: string | null;
    email_addresses?: Array<{ id: string; email_address: string }>;
    phone_numbers?: Array<{ id: string; phone_number: string }>;
  };
};

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { detail: "Webhook secret not configured", code: "http_500" },
      { status: 500 },
    );
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { detail: "Missing Svix headers", code: "http_400" },
      { status: 400 },
    );
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json(
      { detail: "Invalid webhook signature", code: "http_400" },
      { status: 400 },
    );
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    await upsertUserFromClerkWebhook(event.data);
  } else if (event.type === "user.deleted" && event.data.id) {
    await deleteUser(event.data.id);
  }

  return NextResponse.json({ status: "ok" });
}
