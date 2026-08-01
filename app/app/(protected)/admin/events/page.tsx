import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminEventsPanel } from "@/components/admin/events-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "EVENT_MANAGE")) {
    redirect("/dashboard");
  }

  return <AdminEventsPanel />;
}
