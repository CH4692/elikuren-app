import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";
import { LibraryAudio } from "@/components/library/library-audio";

export default function LibraryAudioPage() {
  return (
    <MemberShell>
      <MemberPageIntro
        title="Audio"
        description="Übedateien und Mitschnitte durchsuchen."
      />
      <LibraryAudio />
    </MemberShell>
  );
}
