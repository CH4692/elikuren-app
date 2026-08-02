import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { updateSiteSection } from "@/lib/site-content";

type Params = {
  params: Promise<{ pageKey: string; sectionKey: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const gate = await requirePermission("SITE_MANAGE");
  if (!gate.ok) return gate.response;

  const { pageKey, sectionKey } = await params;
  const body = (await request.json()) as {
    data?: unknown;
    isVisible?: boolean;
  };

  if (body.data === undefined) {
    return NextResponse.json(
      { detail: "data fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const section = await updateSiteSection({
      pageKey,
      sectionKey,
      data: body.data,
      isVisible: body.isVisible,
    });
    return NextResponse.json({
      id: section.id,
      key: section.key,
      is_visible: section.isVisible,
      data: section.data,
      updated_at: section.updatedAt.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Speichern fehlgeschlagen";
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
