import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { MemberShell } from "@/components/app/member-shell";
import { prisma } from "@/lib/db";
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

  // Admin-Rollen starten im Verwaltungsbereich, nicht im Mitglieder-Dashboard.
  if (hasAdminAreaAccess(user.role)) redirect("/admin");

  const pieces = await listPublishedPiecesForUser({
    role: user.role,
    voice: user.voice,
  });

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
        at: s.createdAt,
      })),
    ),
    ...pieces.flatMap((p) =>
      p.audioFiles.map((a) => ({
        pieceId: p.id,
        pieceTitle: p.title,
        name: a.storedFile.originalName,
        kind: "audio" as const,
        at: a.createdAt,
      })),
    ),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 5)
    .map(({ pieceId, pieceTitle, name, kind }) => ({
      pieceId,
      pieceTitle,
      name,
      kind,
    }));

  return (
    <MemberShell>
      <MemberDashboard
        firstname={user.firstname}
        voice={user.voice}
        currentProject={currentProject}
        recentLibrary={recentLibrary}
      />
    </MemberShell>
  );
}
