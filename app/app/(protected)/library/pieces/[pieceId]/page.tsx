import { PieceDetail } from "@/components/library/piece-detail";

type Props = { params: Promise<{ pieceId: string }> };

export default async function LibraryPiecePage({ params }: Props) {
  const { pieceId } = await params;
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-16 pt-28">
      <PieceDetail pieceId={pieceId} />
    </main>
  );
}
