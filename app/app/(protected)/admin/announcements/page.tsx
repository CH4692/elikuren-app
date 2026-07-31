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

  return <AdminAnnouncementsPanel />;
}
