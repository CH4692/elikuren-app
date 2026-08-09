import { NextResponse } from "next/server";

import { requireActiveSession } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { headObject, r2Configured } from "@/lib/r2";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const gate = await requireActiveSession();
  if (!gate.ok) return gate.response;

  if (!r2Configured()) {
    return NextResponse.json(
      { detail: "Dateispeicher ist nicht konfiguriert", code: "r2_unconfigured" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const file = await prisma.storedFile.findUnique({ where: { id } });
  if (!file || file.deletedAt) {
    return NextResponse.json(
      { detail: "Datei nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const isUploader = file.uploadedById === gate.user.id;
  const canManage =
    (file.category === "INVOICE" &&
      hasPermission(gate.user.role, "INVOICE_WRITE")) ||
    (file.category === "IMAGE" &&
      hasPermission(gate.user.role, "MEDIA_MANAGE")) ||
    (file.category !== "INVOICE" &&
      file.category !== "IMAGE" &&
      hasPermission(gate.user.role, "PIECE_MANAGE"));

  if (!isUploader && !canManage) {
    return NextResponse.json(
      { detail: "Forbidden", code: "http_403" },
      { status: 403 },
    );
  }

  if (file.uploadStatus === "READY") {
    return NextResponse.json({
      fileId: file.id,
      uploadStatus: file.uploadStatus,
    });
  }

  try {
    const head = await headObject(file.objectKey);
    const remoteSize = head.ContentLength ?? 0;
    const remoteType = head.ContentType ?? "";

    if (remoteSize !== file.sizeBytes) {
      await prisma.storedFile.update({
        where: { id: file.id },
        data: { uploadStatus: "FAILED" },
      });
      return NextResponse.json(
        { detail: "Dateigröße stimmt nicht überein", code: "upload_mismatch" },
        { status: 400 },
      );
    }

    if (remoteType && remoteType !== file.mimeType) {
      // Some clients omit charset; allow prefix match for application/pdf
      if (!remoteType.startsWith(file.mimeType.split(";")[0]!)) {
        await prisma.storedFile.update({
          where: { id: file.id },
          data: { uploadStatus: "FAILED" },
        });
        return NextResponse.json(
          { detail: "MIME-Type stimmt nicht überein", code: "upload_mismatch" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.storedFile.update({
      where: { id: file.id },
      data: {
        uploadStatus: "READY",
        etag: head.ETag?.replaceAll('"', "") ?? null,
      },
    });

    return NextResponse.json({
      fileId: updated.id,
      uploadStatus: updated.uploadStatus,
    });
  } catch (error) {
    await prisma.storedFile.update({
      where: { id: file.id },
      data: { uploadStatus: "FAILED" },
    });
    console.error("upload complete failed", error);
    return NextResponse.json(
      { detail: "Upload konnte nicht bestätigt werden", code: "http_400" },
      { status: 400 },
    );
  }
}
