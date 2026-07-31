import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import { listMembers, serializeMember } from "@/lib/members";

export async function GET(request: Request) {
  const gate = await requirePermission("MEMBER_MANAGE");
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const members = await listMembers(q);

  return NextResponse.json({
    items: members.map(serializeMember),
  });
}
