import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MemberShell } from "@/components/app/member-shell";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { getCurrentConcert, serializeConcert } from "@/lib/concerts";
import { prisma } from "@/lib/db";
import { hasAdminAreaAccess } from "@/lib/permissions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstname: true,
      voice: true,
      role: true,
      isActive: true,
    },
  });
  if (!user?.isActive) redirect("/auth/sign-in");

  // Admin-Rollen starten im Verwaltungsbereich, nicht im Mitglieder-Dashboard.
  if (hasAdminAreaAccess(user.role)) redirect("/admin");

  const current = await getCurrentConcert(user.role);
  const activeConcert = current
    ? (() => {
        const serialized = serializeConcert(current);
        return {
          title: serialized.title,
          date: serialized.date,
          year: serialized.year,
          location: serialized.location,
        };
      })()
    : null;

  return (
    <MemberShell>
      <MemberDashboard
        firstname={user.firstname}
        voice={user.voice}
        activeConcert={activeConcert}
      />
    </MemberShell>
  );
}
