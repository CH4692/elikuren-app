import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasAdminAreaAccess } from "@/lib/permissions";
import { getUserById, serializeUser } from "@/lib/users";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/auth/sign-in");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-28">
      <Card>
        <CardHeader>
          <CardTitle>Mein Profil</CardTitle>
          <CardDescription>
            Verwalte deine Mitgliedsdaten für den Kammerchor Elikuren.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense fallback={<p className="text-sm text-[#5c574e]">Lädt…</p>}>
            <ProfileForm initialUser={serializeUser(user)} />
          </Suspense>
          {hasAdminAreaAccess(user.role) ? (
            <p className="text-sm text-[#5c574e]">
              <Link
                href="/admin"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Zur Verwaltung
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
