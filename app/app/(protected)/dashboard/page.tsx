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
  const [pieces, events] = await Promise.all([
    listPublishedPiecesForUser({
      role: user.role,
      voice: user.voice,
    }),
    listEventsForMember(session.user.id, now),
  ]);

  const rehearsing = pieces.filter((p) => p.rehearsalStatus === "REHEARSING");
  const featured = rehearsing[0] ?? null;

  const currentProject = featured
    ? {
        id: featured.id,
        title: featured.title,
        composer: featured.composer,
        sheetCount: featured.sheetFiles.length,
        audioCount: featured.audioFiles.length,
      }
    : null;

  const recentLibrary = [
    ...pieces.flatMap((p) =>
      p.sheetFiles.map((s) => ({
        pieceId: p.id,
        pieceTitle: p.title,
        name: s.storedFile.originalName,
        kind: "score" as const,
        at: s.publishedAt,
      })),
    ),
    ...pieces.flatMap((p) =>
      p.audioFiles.map((a) => ({
        pieceId: p.id,
        pieceTitle: p.title,
        name: a.storedFile.originalName,
        kind: "audio" as const,
        at: a.publishedAt,
      })),
    ),
  ]
    .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
    .slice(0, 5)
    .map(({ pieceId, pieceTitle, name, kind }) => ({
      pieceId,
      pieceTitle,
      name,
      kind,
    }));

  const next = events[0] ?? null;
  const nextEvent = next
    ? {
        id: next.id,
        title: next.title,
        startsAt: next.startsAt,
        location: next.location,
      }
    : null;

  return (
    <MemberShell>
      <MemberDashboard
        firstname={user.firstname}
        voice={user.voice}
        showAdmin={hasAdminAreaAccess(user.role)}
        nextEvent={nextEvent}
        currentProject={currentProject}
        recentLibrary={recentLibrary}
      />
    </MemberShell>
  );
}
