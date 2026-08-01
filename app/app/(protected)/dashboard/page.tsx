import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { MemberShell } from "@/components/app/member-shell";
import { prisma } from "@/lib/db";
import { listLibraryAudio, listLibraryScores } from "@/lib/library";
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

  const [scores, audios] = await Promise.all([
    listLibraryScores({ role: user.role, voice: user.voice }),
    listLibraryAudio({ role: user.role, voice: user.voice }),
  ]);

  const recentLibrary = [
    ...scores.map((s) => ({
      title: s.title,
      name: s.original_name,
      kind: "score" as const,
      at: s.created_at,
    })),
    ...audios.map((a) => ({
      title: a.title,
      name: a.original_name,
      kind: "audio" as const,
      at: a.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5)
    .map(({ title, name, kind }) => ({ title, name, kind }));

  return (
    <MemberShell>
      <MemberDashboard
        firstname={user.firstname}
        voice={user.voice}
        recentLibrary={recentLibrary}
      />
    </MemberShell>
  );
}
