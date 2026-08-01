import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";
import { LibraryScores } from "@/components/library/library-scores";

export default function LibraryScoresPage() {
  return (
    <MemberShell>
      <MemberPageIntro
        title="Noten & Stücke"
        description="Partituren und Stimmen – suchen, filtern und in der Vorschau öffnen."
      />
      <LibraryScores />
    </MemberShell>
  );
}
