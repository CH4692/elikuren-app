import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InvoicesPanel } from "@/components/admin/invoices-panel";
import { hasPermission } from "@/lib/permissions";

export default async function AdminInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");
  if (!hasPermission(session.user.role, "INVOICE_READ")) {
    redirect("/dashboard");
  }

  const role = session.user.role;

  return (
    <InvoicesPanel
      canWrite={hasPermission(role, "INVOICE_WRITE")}
      canRecordPayment={hasPermission(role, "PAYMENT_RECORD")}
    />
  );
}
