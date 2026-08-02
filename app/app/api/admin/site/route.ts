import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/authz";
import {
  ensureSiteContentSeeded,
  listSitePagesAdmin,
} from "@/lib/site-content";

export async function GET() {
  const gate = await requirePermission("SITE_MANAGE");
  if (!gate.ok) return gate.response;

  await ensureSiteContentSeeded();
  const pages = await listSitePagesAdmin();
  return NextResponse.json({ pages });
}
