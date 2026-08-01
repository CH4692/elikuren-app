import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ScoresPanel } from "@/components/admin/scores-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminScoresPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "PIECE_MANAGE")) {
    redirect("/dashboard");
  }

  return <ScoresPanel />;
}
