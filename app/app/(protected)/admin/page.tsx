import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions";

const LINKS = [
  {
    href: "/admin/requests",
    title: "Zugangsanfragen",
    description: "Mitgliedschaft freigeben oder ablehnen",
    permission: "ACCESS_REQUEST_MANAGE" as const,
  },
  {
    href: "/admin/members",
    title: "Mitglieder",
    description: "Stimme, Aktivstatus und Rollen",
    permission: "MEMBER_MANAGE" as const,
  },
];

export default async function AdminIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = session.user.role;
  const available = LINKS.filter((link) => hasPermission(role, link.permission));

  if (available.length === 1) {
    redirect(available[0]!.href);
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-28">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Verwaltung</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {available.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition hover:border-[#C8A24D]/50">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
