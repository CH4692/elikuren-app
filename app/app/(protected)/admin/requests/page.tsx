import { MembershipRequestsPanel } from "@/components/admin/membership-requests-panel";

export default function AdminRequestsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-28">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">
        Mitgliederfreigaben
      </h1>
      <MembershipRequestsPanel />
    </main>
  );
}
