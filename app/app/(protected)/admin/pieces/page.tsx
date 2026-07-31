import { PiecesPanel } from "@/components/admin/pieces-panel";

export default function AdminPiecesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-28">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Stücke</h1>
      <PiecesPanel />
    </main>
  );
}
