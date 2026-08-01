import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { MemberShell } from "@/components/app/member-shell";
import { prisma } from "@/lib/db";
import { listEventsForMember } from "@/lib/events";
import { listPublishedPiecesForUser } from "@/lib/library";
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

  const now = new Date();
  const [importantAnnouncements, pieces, events] = await Promise.all([
    prisma.announcement.findMany({
      where: {
        publishedAt: { not: null, lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        isImportant: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, publishedAt: true },
    }),
    listPublishedPiecesForUser({
      role: user.role,
      voice: user.voice,
    }),
    listEventsForMember(session.user.id, now),
  ]);

  const rehearsing = pieces
    .filter((p) => p.rehearsalStatus === "REHEARSING")
    .slice(0, 5)
    .map((p) => ({ id: p.id, title: p.title, composer: p.composer }));

  const recentSheets = pieces
    .flatMap((p) =>
      p.sheetFiles.map((s) => ({
        pieceId: p.id,
        title: p.title,
        name: s.storedFile.originalName,
        at: s.publishedAt,
      })),
    )
    .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
    .slice(0, 5)
    .map(({ pieceId, title, name }) => ({ pieceId, title, name }));

  const upcomingEvents = events.slice(0, 4).map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt,
    location: e.location,
  }));

  return (
    <MemberShell>
      <MemberDashboard
        firstname={user.firstname}
        voice={user.voice}
        showAdmin={hasAdminAreaAccess(user.role)}
        announcements={importantAnnouncements}
        upcomingEvents={upcomingEvents}
        rehearsing={rehearsing}
        recentSheets={recentSheets}
      />
    </MemberShell>
  );
}
