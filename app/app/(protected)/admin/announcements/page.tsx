import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminAnnouncementsPanel } from "@/components/admin/announcements-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "ANNOUNCEMENT_MANAGE")) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-28">
      <div className="mb-4">
        <Link href="/admin" className="text-sm text-[#5c574e] hover:underline">
          ← Verwaltung
        </Link>
      </div>
      <AdminAnnouncementsPanel />
    </main>
  );
}
