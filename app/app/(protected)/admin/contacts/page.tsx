import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ContactsPanel } from "@/components/admin/contacts-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminContactsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "CONTACT_MANAGE")) {
    redirect("/dashboard");
  }

  return <ContactsPanel />;
}
