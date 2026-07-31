import type { Prisma } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/db";

const SENSITIVE_KEY =
  /(secret|token|password|authorization|presign|signedurl|accesskey|cookie)/i;

function sanitizeMetadata(
  metadata?: Prisma.InputJsonValue,
): Prisma.InputJsonValue | undefined {
  if (metadata == null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return metadata;
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (typeof value === "string" && /https?:\/\/.+(X-Amz-|Signature=)/i.test(value)) {
      continue;
    }
    out[key] = value;
  }
  return out as Prisma.InputJsonValue;
}

export async function writeAuditLog(input: {
  action: string;
  entityType: string;
  entityId?: string | null;
  actorUserId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        actorUserId: input.actorUserId ?? null,
        metadata: sanitizeMetadata(input.metadata),
      },
    });
  } catch (error) {
    console.error("audit write failed", error);
  }
}

/** Compatibility wrapper for former access-audit calls. */
export async function writeAccessAudit(input: {
  action:
    | "request_created"
    | "approved"
    | "rejected"
    | "disabled"
    | "enabled"
    | "magic_link_denied"
    | "magic_link_sent";
  targetEmail: string;
  actorUserId?: string | null;
  requestId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  const actionMap = {
    request_created: "access.request_created",
    approved: "access.approved",
    rejected: "access.rejected",
    disabled: "user.disabled",
    enabled: "user.enabled",
    magic_link_denied: "access.magic_link_denied",
    magic_link_sent: "access.magic_link_sent",
  } as const;

  await writeAuditLog({
    action: actionMap[input.action],
    entityType: input.requestId ? "membership_request" : "user",
    entityId: input.requestId ?? null,
    actorUserId: input.actorUserId,
    metadata: {
      ...(typeof input.metadata === "object" &&
      input.metadata &&
      !Array.isArray(input.metadata)
        ? input.metadata
        : {}),
      targetEmail: input.targetEmail.trim().toLowerCase(),
    },
  });
}
