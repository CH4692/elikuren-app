import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { MemberShell } from "@/components/app/member-shell";
import { PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { hasAdminAreaAccess } from "@/lib/permissions";
import { getUserById, serializeUser } from "@/lib/users";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/auth/sign-in");

  return (
    <MemberShell narrow>
      <PageHeader
        title="Mein Profil"
        description="Verwalte deine Mitgliedsdaten für den Kammerchor Elikuren."
      />
      <Card className="border-[#ebe4d8] bg-white/80">
        <CardContent className="space-y-6 pt-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            }
          >
            <ProfileForm initialUser={serializeUser(user)} />
          </Suspense>
          {hasAdminAreaAccess(user.role) ? (
            <p className="text-sm text-[#5c574e]">
              <Link
                href="/admin"
                className="font-medium text-[#C8A24D] underline-offset-4 hover:underline"
              >
                Zur Verwaltung
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </MemberShell>
  );
}
