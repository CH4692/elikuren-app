import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { WebsiteOverview } from "@/components/admin/cms/website-overview";
import { hasPermission } from "@/lib/permissions";

export default async function AdminSitePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "SITE_MANAGE")) {
    redirect("/dashboard");
  }

  return <WebsiteOverview />;
}
