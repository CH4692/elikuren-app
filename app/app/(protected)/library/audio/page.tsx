import { MemberShell } from "@/components/app/member-shell";
import { PageHeader } from "@/components/app/page-header";
import { LibraryAudio } from "@/components/library/library-audio";

export default function LibraryAudioPage() {
  return (
    <MemberShell>
      <PageHeader
        title="Audio & Üben"
        description="Übematerial zum Anhören – nach Stück oder Stimme filtern."
      />
      <LibraryAudio />
    </MemberShell>
  );
}
