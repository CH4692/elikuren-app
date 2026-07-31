import { PieceEditor } from "@/components/admin/piece-editor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPieceDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-28">
      <PieceEditor pieceId={id} />
    </main>
  );
}
