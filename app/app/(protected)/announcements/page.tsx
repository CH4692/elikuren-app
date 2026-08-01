import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import { MemberShell } from "@/components/app/member-shell";
import { PageHeader } from "@/components/app/page-header";

export default function AnnouncementsPage() {
  return (
    <MemberShell narrow>
      <PageHeader
        title="Mitteilungen"
        description="Aktuelle Hinweise und Ankündigungen vom Vorstand."
      />
      <AnnouncementsPanel />
    </MemberShell>
  );
}
