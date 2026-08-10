import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CmsPageEditor } from "@/components/admin/cms/cms-page-editor";
import { hasPermission } from "@/lib/permissions";
import { isPublicSitePageKey } from "@/lib/site-content/registry";

type Props = { params: Promise<{ pageKey: string }> };

export default async function AdminSitePageEditor({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "SITE_MANAGE")) {
    redirect("/dashboard");
  }

  const { pageKey } = await params;
  if (!isPublicSitePageKey(pageKey)) {
    notFound();
  }

  return <CmsPageEditor pageKey={pageKey} mode="page" />;
}
