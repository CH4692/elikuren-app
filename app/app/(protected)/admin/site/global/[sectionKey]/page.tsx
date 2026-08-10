import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CmsPageEditor } from "@/components/admin/cms/cms-page-editor";
import { hasPermission } from "@/lib/permissions";
import { isGlobalSectionKey } from "@/lib/site-content/defaults";
import { GLOBAL_PAGE_KEY } from "@/lib/site-content/registry";

type Props = { params: Promise<{ sectionKey: string }> };

export default async function AdminGlobalSectionEditor({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "SITE_MANAGE")) {
    redirect("/dashboard");
  }

  const { sectionKey } = await params;
  if (!isGlobalSectionKey(sectionKey)) {
    notFound();
  }

  return (
    <CmsPageEditor
      pageKey={GLOBAL_PAGE_KEY}
      mode="global"
      sectionKey={sectionKey}
    />
  );
}
