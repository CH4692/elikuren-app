import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";
import { LibraryScores } from "@/components/library/library-scores";

export default function LibraryScoresPage() {
  return (
    <MemberShell>
      <MemberPageIntro
        title="Noten"
        description="Noten des aktuellen Konzertprogramms und Gesamtkatalog durchsuchen."
      />
      <LibraryScores />
    </MemberShell>
  );
}
