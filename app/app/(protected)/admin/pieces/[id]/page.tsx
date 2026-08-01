import { PieceEditor } from "@/components/admin/piece-editor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPieceDetailPage({ params }: Props) {
  const { id } = await params;
  return <PieceEditor pieceId={id} />;
}
