import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const gate = await requirePermission("AUDIT_READ");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? "30") || 30),
  );
  const action = searchParams.get("action")?.trim() || undefined;
  const entityType = searchParams.get("entityType")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  const where = {
    ...(action ? { action: { contains: action, mode: "insensitive" as const } } : {}),
    ...(entityType
      ? { entityType: { contains: entityType, mode: "insensitive" as const } }
      : {}),
    ...(q
      ? {
          OR: [
            { action: { contains: q, mode: "insensitive" as const } },
            { entityType: { contains: q, mode: "insensitive" as const } },
            { entityId: { contains: q, mode: "insensitive" as const } },
            {
              actor: {
                OR: [
                  { email: { contains: q, mode: "insensitive" as const } },
                  { firstname: { contains: q, mode: "insensitive" as const } },
                  { lastname: { contains: q, mode: "insensitive" as const } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    items: rows.map((row) => ({
      id: row.id,
      action: row.action,
      entity_type: row.entityType,
      entity_id: row.entityId,
      metadata: row.metadata,
      created_at: row.createdAt.toISOString(),
      actor: row.actor
        ? {
            id: row.actor.id,
            email: row.actor.email,
            firstname: row.actor.firstname,
            lastname: row.actor.lastname,
          }
        : null,
    })),
  });
}
