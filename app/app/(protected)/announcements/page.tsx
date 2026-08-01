import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";

export default function AnnouncementsPage() {
  return (
    <MemberShell>
      <MemberPageIntro
        title="Mitteilungen"
        description="Aktuelle Hinweise und Ankündigungen vom Vorstand."
      />
      <AnnouncementsPanel />
    </MemberShell>
  );
}
