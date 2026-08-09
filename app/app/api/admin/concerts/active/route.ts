import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { serializeConcert, setActiveConcert } from "@/lib/concerts";

export async function POST(request: Request) {
  const gate = await requirePermission("CONCERT_MANAGE");
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as { concertId?: string | null };

  try {
    const concert = await setActiveConcert(body.concertId ?? null);
    return NextResponse.json({
      concert: concert ? serializeConcert(concert) : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Aktives Konzert fehlgeschlagen";
    const status = message.includes("nicht gefunden") ? 404 : 400;
    return NextResponse.json(
      {
        detail: message,
        code: status === 404 ? "not_found" : "validation_error",
      },
      { status },
    );
  }
}
