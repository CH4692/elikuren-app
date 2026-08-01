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
  const canInvoices = hasPermission(role, "INVOICE_READ");

  const now = new Date();
  const [openRequests, draftPieces, overdueInvoices] = await Promise.all([
    canRequests
      ? prisma.membershipRequest.count({ where: { status: "pending" } })
      : Promise.resolve(null),
    canPieces
      ? prisma.musicPiece.count({ where: { publicationStatus: "DRAFT" } })
      : Promise.resolve(null),
    canInvoices
      ? prisma.invoice.count({
          where: {
            OR: [
              { status: "OVERDUE" },
              {
                status: "OPEN",
                dueDate: { lt: now },
              },
            ],
          },
        })
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
    canInvoices
      ? {
          href: "/admin/invoices",
          title: "Überfällige Rechnungen",
          value: overdueInvoices ?? 0,
          description: "Fälligkeit überschritten",
          icon: ADMIN_KPI_ICONS.invoices,
          attention: true,
        }
      : null,
  ].filter(Boolean) as AdminKpi[];

  return <AdminOverview role={role} kpis={kpis} />;
}
