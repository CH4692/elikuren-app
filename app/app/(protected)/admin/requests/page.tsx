import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MembershipRequestsPanel } from "@/components/admin/membership-requests-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminRequestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "ACCESS_REQUEST_MANAGE")) {
    redirect("/dashboard");
  }

  return <MembershipRequestsPanel />;
}
