import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ConcertsPanel } from "@/components/admin/concerts-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminConcertsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "PIECE_MANAGE")) {
    redirect("/dashboard");
  }

  return <ConcertsPanel />;
}
