import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PicturesPanel } from "@/components/admin/pictures-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminPicturesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "MEDIA_MANAGE")) {
    redirect("/dashboard");
  }

  return <PicturesPanel />;
}
