import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
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
      <MemberPageIntro
        title="Mein Profil"
        description="Verwalte deine Mitgliedsdaten für den Kammerchor Elikuren."
        actions={
          hasAdminAreaAccess(user.role) ? (
            <Button asChild variant="outline" className="border-[#d9d2c4]">
              <Link href="/admin">Zur Verwaltung</Link>
            </Button>
          ) : null
        }
      />
      <Card className="border-[#d9d2c4] bg-white/80 shadow-sm">
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
        </CardContent>
      </Card>
    </MemberShell>
  );
}
