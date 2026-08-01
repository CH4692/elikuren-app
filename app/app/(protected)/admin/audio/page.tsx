import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AudioFilesPanel } from "@/components/admin/audio-files-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminAudioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "PIECE_MANAGE")) {
    redirect("/dashboard");
  }

  return <AudioFilesPanel />;
}
