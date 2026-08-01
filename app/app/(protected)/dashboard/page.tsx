import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MemberShell } from "@/components/app/member-shell";
import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const now = new Date();
  const [importantAnnouncements, pieces] = await Promise.all([
    prisma.announcement.findMany({
      where: {
        publishedAt: { not: null, lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        isImportant: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    listPublishedPiecesForUser({
      role: user.role,
      voice: user.voice,
    }),
  ]);

  const rehearsing = pieces.filter((p) => p.rehearsalStatus === "REHEARSING");
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
    .slice(0, 5);

  const links = [
    { href: "/library/scores", title: "Noten", description: "Partituren und Stimmen" },
    { href: "/library/audio", title: "Audio", description: "Übematerial" },
    {
      href: "/announcements",
      title: "Mitteilungen",
      description: "Aktuelle Hinweise",
    },
    { href: "/profile", title: "Profil", description: "Meine Daten" },
  ];

  return (
    <MemberShell>
      <PageHeader
        title={`Hallo${user.firstname ? ` ${user.firstname}` : ""}`}
        description={
          user.voice
            ? `Deine Stimme: ${user.voice}`
            : "Stimme noch nicht hinterlegt – bitte im Profil ergänzen."
        }
      />

      {importantAnnouncements.length > 0 ? (
        <section className="mb-8 space-y-2">
          <h2 className="text-lg font-medium">Wichtige Mitteilungen</h2>
          <ul className="space-y-2">
            {importantAnnouncements.map((a) => (
              <li key={a.id}>
                <Link
                  href="/announcements"
                  className="block rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rehearsing.length > 0 ? (
        <section className="mb-8 space-y-2">
          <h2 className="text-lg font-medium">Aktuell in Probe</h2>
          <ul className="space-y-2">
            {rehearsing.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/library/pieces/${p.id}`}
                  className="block rounded-lg border border-[#C8A24D]/25 px-4 py-3"
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="text-sm text-[#5c574e]"> · {p.composer}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recentSheets.length > 0 ? (
        <section className="mb-8 space-y-2">
          <h2 className="text-lg font-medium">Neue Noten</h2>
          <ul className="space-y-2 text-sm">
            {recentSheets.map((s) => (
              <li key={`${s.pieceId}-${s.name}`}>
                <Link
                  href={`/library/pieces/${s.pieceId}`}
                  className="hover:underline"
                >
                  {s.title}: {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition hover:border-[#C8A24D]/50">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        {hasAdminAreaAccess(user.role) ? (
          <Link href="/admin">
            <Card className="h-full transition hover:border-[#C8A24D]/50">
              <CardHeader>
                <CardTitle>Verwaltung</CardTitle>
                <CardDescription>Stücke, Mitglieder und Mitteilungen</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ) : null}
      </section>
    </MemberShell>
  );
}
