import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  ADMIN_KPI_ICONS,
  AdminOverview,
  type AdminKpi,
} from "@/components/admin/admin-overview";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export default async function AdminIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = session.user.role;
  const canRequests = hasPermission(role, "ACCESS_REQUEST_MANAGE");
  const canPieces = hasPermission(role, "PIECE_MANAGE");

  const [openRequests, draftPieces] = await Promise.all([
    canRequests
      ? prisma.membershipRequest.count({ where: { status: "pending" } })
      : Promise.resolve(null),
    canPieces
      ? prisma.musicPiece.count({ where: { publicationStatus: "DRAFT" } })
      : Promise.resolve(null),
  ]);

  const kpis: AdminKpi[] = [
    canRequests
      ? {
          href: "/admin/requests",
          title: "Offene Anfragen",
          value: openRequests ?? 0,
          description: "Warten auf Freigabe",
          icon: ADMIN_KPI_ICONS.requests,
          attention: true,
        }
      : null,
    canPieces
      ? {
          href: "/admin/pieces",
          title: "Entwürfe",
          value: draftPieces ?? 0,
          description: "Unveröffentlichte Stücke",
          icon: ADMIN_KPI_ICONS.pieces,
        }
      : null,
  ].filter(Boolean) as AdminKpi[];

  return <AdminOverview role={role} kpis={kpis} />;
}
