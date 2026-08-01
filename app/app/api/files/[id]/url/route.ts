import { NextResponse } from "next/server";

import { requireActiveSession } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { canAccessScopedFile } from "@/lib/files";
import { hasPermission } from "@/lib/permissions";
import { createPresignedGetUrl, r2Configured } from "@/lib/r2";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const gate = await requireActiveSession();
  if (!gate.ok) return gate.response;

  if (!r2Configured()) {
    return NextResponse.json(
      { detail: "Dateispeicher ist nicht konfiguriert", code: "r2_unconfigured" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const dispositionParam = new URL(request.url).searchParams.get("disposition");
  const disposition =
    dispositionParam === "attachment" ? "attachment" : "inline";

  const file = await prisma.storedFile.findUnique({
    where: { id },
    include: {
      sheetFiles: true,
      audioFiles: true,
      invoices: { select: { id: true } },
    },
  });

  if (!file || file.deletedAt || file.uploadStatus !== "READY") {
    return NextResponse.json(
      { detail: "Datei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  if (file.category === "INVOICE") {
    if (!hasPermission(gate.user.role, "INVOICE_READ")) {
      return NextResponse.json(
        { detail: "Forbidden", code: "http_403" },
        { status: 403 },
      );
    }
  } else if (file.category === "SHEET" || file.category === "AUDIO") {
    if (!hasPermission(gate.user.role, "MEMBER_CONTENT_READ")) {
      return NextResponse.json(
        { detail: "Forbidden", code: "http_403" },
        { status: 403 },
      );
    }

    const sheet = file.sheetFiles[0];
    const audio = file.audioFiles[0];
    const link = sheet ?? audio;
    if (!link) {
      if (!hasPermission(gate.user.role, "PIECE_MANAGE")) {
        return NextResponse.json(
          { detail: "Forbidden", code: "http_403" },
          { status: 403 },
        );
      }
    } else {
      const isAdmin = hasPermission(gate.user.role, "PIECE_MANAGE");
      if (!link.isVisible && !isAdmin) {
        return NextResponse.json(
          { detail: "Forbidden", code: "http_403" },
          { status: 403 },
        );
      }

      if (
        !canAccessScopedFile({
          accessScope: link.accessScope,
          fileVoiceGroup: link.voiceGroup,
          userRole: gate.user.role,
          userVoice: gate.user.voice,
        })
      ) {
        return NextResponse.json(
          { detail: "Forbidden", code: "http_403" },
          { status: 403 },
        );
      }
    }
  } else if (!hasPermission(gate.user.role, "MEMBER_CONTENT_READ")) {
    return NextResponse.json(
      { detail: "Forbidden", code: "http_403" },
      { status: 403 },
    );
  }

  try {
    const { url, expiresIn } = await createPresignedGetUrl({
      objectKey: file.objectKey,
      fileName: file.originalName,
      contentType: file.mimeType,
      disposition,
    });

    return NextResponse.json({ url, expiresIn, mimeType: file.mimeType });
  } catch (error) {
    console.error("presigned get failed", error);
    return NextResponse.json(
      { detail: "URL konnte nicht erzeugt werden", code: "http_500" },
      { status: 500 },
    );
  }
}
