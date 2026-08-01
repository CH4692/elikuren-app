import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";
import { LibraryAudio } from "@/components/library/library-audio";

export default function LibraryAudioPage() {
  return (
    <MemberShell>
      <MemberPageIntro
        title="Audio & Üben"
        description="Üben nach Stück und Stimme, oder Mitschnitte nach Konzert."
      />
      <LibraryAudio />
    </MemberShell>
  );
}
