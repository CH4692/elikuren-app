import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAnyPermission } from "@/lib/authz";
import { prisma } from "@/lib/db";
import {
  audioKindFromType,
  objectKeyFor,
  validateUploadInput,
  type AudioObjectKind,
} from "@/lib/files";
import type { StoredFileCategory } from "@/lib/generated/prisma/client";
import { createPresignedPutUrl, r2Configured } from "@/lib/r2";

type Body = {
  category?: StoredFileCategory;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  invoiceId?: string;
  concertId?: string | null;
  audioType?: string | null;
  audioKind?: AudioObjectKind;
};

function permissionForCategory(category: StoredFileCategory) {
  if (category === "INVOICE") {
    return ["INVOICE_WRITE"] as const;
  }
  return ["PIECE_MANAGE"] as const;
}

export async function POST(request: Request) {
  if (!r2Configured()) {
    return NextResponse.json(
      { detail: "Dateispeicher ist nicht konfiguriert", code: "r2_unconfigured" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Body;
  const category = body.category;
  if (!category) {
    return NextResponse.json(
      { detail: "category fehlt", code: "validation_error" },
      { status: 400 },
    );
  }

  const needed = permissionForCategory(category);
  if (!needed) {
    return NextResponse.json(
      { detail: "Kategorie nicht unterstützt", code: "validation_error" },
      { status: 400 },
    );
  }

  const gate = await requireAnyPermission(needed);
  if (!gate.ok) return gate.response;

  const originalName = String(body.originalName ?? "").trim();
  const mimeType = String(body.mimeType ?? "").trim();
  const sizeBytes = Number(body.sizeBytes);
  if (!originalName || !mimeType || !Number.isFinite(sizeBytes)) {
    return NextResponse.json(
      { detail: "Ungültige Upload-Metadaten", code: "validation_error" },
      { status: 400 },
    );
  }

  const validated = validateUploadInput({
    category,
    originalName,
    mimeType,
    sizeBytes,
  });
  if (!validated.ok) {
    return NextResponse.json(
      { detail: validated.error, code: "validation_error" },
      { status: 400 },
    );
  }

  const fileId = randomUUID();
  const audioKind =
    body.audioKind ??
    (category === "AUDIO" ? audioKindFromType(body.audioType) : undefined);
  const objectKey = objectKeyFor({
    category,
    fileId,
    invoiceId: body.invoiceId,
    concertId: body.concertId,
    audioKind,
    extension: validated.extension,
  });

  const stored = await prisma.storedFile.create({
    data: {
      id: fileId,
      objectKey,
      originalName,
      mimeType,
      sizeBytes,
      category,
      uploadStatus: "PENDING",
      uploadedById: gate.user.id,
    },
  });

  try {
    const { url, expiresIn } = await createPresignedPutUrl({
      objectKey,
      contentType: mimeType,
      contentLength: sizeBytes,
    });

    return NextResponse.json({
      fileId: stored.id,
      uploadUrl: url,
      expiresIn,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(sizeBytes),
      },
    });
  } catch (error) {
    await prisma.storedFile.update({
      where: { id: stored.id },
      data: { uploadStatus: "FAILED" },
    });
    console.error("presign failed", error);
    return NextResponse.json(
      { detail: "Upload-URL konnte nicht erzeugt werden", code: "http_500" },
      { status: 500 },
    );
  }
}
