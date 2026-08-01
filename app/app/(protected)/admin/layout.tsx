import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { hasAdminAreaAccess } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasAdminAreaAccess(session.user.role)) redirect("/dashboard");

  return <AdminShell role={session.user.role}>{children}</AdminShell>;
}
