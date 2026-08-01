import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { listMembershipRequests } from "@/lib/membership-requests";
import type { MembershipRequestStatus } from "@/lib/generated/prisma/client";

export async function GET(request: Request) {
  const gate = await requirePermission("ACCESS_REQUEST_MANAGE");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as MembershipRequestStatus | null;
  const items = await listMembershipRequests(status ?? undefined);

  return NextResponse.json({
    items: items.map((item) => {
      const reviewer =
        item.status === "approved"
          ? item.approvedBy
          : item.status === "rejected"
            ? item.rejectedBy
            : null;
      const reviewedAt =
        item.status === "approved"
          ? item.approvedAt
          : item.status === "rejected"
            ? item.rejectedAt
            : null;

      return {
        id: item.id,
        email: item.email,
        firstname: item.firstname,
        lastname: item.lastname,
        message: item.message,
        voice: item.voice,
        admin_note: item.adminNote,
        status: item.status,
        created_at: item.createdAt.toISOString(),
        reviewed_at: reviewedAt?.toISOString() ?? null,
        reviewed_by: reviewer
          ? {
              id: reviewer.id,
              email: reviewer.email,
              firstname: reviewer.firstname,
              lastname: reviewer.lastname,
            }
          : null,
      };
    }),
  });
}
