import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  getAdminSitePage,
  isKnownSitePageKey,
  saveSitePage,
} from "@/lib/site-content";

type Params = { params: Promise<{ pageKey: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requirePermission("SITE_MANAGE");
  if (!gate.ok) return gate.response;

  const { pageKey } = await params;
  if (!isKnownSitePageKey(pageKey)) {
    return NextResponse.json(
      { detail: "Unbekannte Seite", code: "unknown_page" },
      { status: 404 },
    );
  }

  const page = await getAdminSitePage(pageKey);
  if (!page) {
    return NextResponse.json(
      { detail: "Seite nicht gefunden", code: "not_found" },
      { status: 404 },
    );
  }
  return NextResponse.json(page);
}

export async function PUT(request: Request, { params }: Params) {
  const gate = await requirePermission("SITE_MANAGE");
  if (!gate.ok) return gate.response;

  const { pageKey } = await params;
  if (!isKnownSitePageKey(pageKey)) {
    return NextResponse.json(
      { detail: "Unbekannte Seite", code: "unknown_page" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    description?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImageId?: string | null;
    sections?: Array<{ key: string; data: unknown; isVisible?: boolean }>;
  };

  if (!Array.isArray(body.sections) || body.sections.length === 0) {
    return NextResponse.json(
      { detail: "sections fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  try {
    const page = await saveSitePage({
      pageKey,
      description: body.description,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogImageId: body.ogImageId,
      sections: body.sections,
    });
    return NextResponse.json(page);
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
