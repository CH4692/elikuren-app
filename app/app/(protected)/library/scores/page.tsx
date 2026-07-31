import { MemberShell } from "@/components/app/member-shell";
import { PageHeader } from "@/components/app/page-header";
import { LibraryScores } from "@/components/library/library-scores";

export default function LibraryScoresPage() {
  return (
    <MemberShell>
      <PageHeader
        title="Noten & Stücke"
        description="Partituren und Stimmen – suchen, filtern und in der Vorschau öffnen."
      />
      <LibraryScores />
    </MemberShell>
  );
}
