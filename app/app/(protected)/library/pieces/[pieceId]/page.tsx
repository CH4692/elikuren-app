import { MemberShell } from "@/components/app/member-shell";
import { PieceDetail } from "@/components/library/piece-detail";

type Props = { params: Promise<{ pieceId: string }> };

export default async function LibraryPiecePage({ params }: Props) {
  const { pieceId } = await params;
  return (
    <MemberShell>
      <PieceDetail pieceId={pieceId} />
    </MemberShell>
  );
}
