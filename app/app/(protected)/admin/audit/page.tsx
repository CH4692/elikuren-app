import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuditPanel } from "@/components/admin/audit-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "AUDIT_READ")) {
    redirect("/dashboard");
  }

  return <AuditPanel />;
}
