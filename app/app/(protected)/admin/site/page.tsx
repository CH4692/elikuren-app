import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteContentPanel } from "@/components/admin/site-content-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminSitePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "SITE_MANAGE")) {
    redirect("/dashboard");
  }

  return <SiteContentPanel />;
}
