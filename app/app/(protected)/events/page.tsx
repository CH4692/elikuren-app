import { MemberShell } from "@/components/app/member-shell";
import { PageHeader } from "@/components/app/page-header";
import { EventsPanel } from "@/components/events/events-panel";

export default function EventsPage() {
  return (
    <MemberShell narrow>
      <PageHeader
        title="Termine"
        description="Proben, Auftritte und Veranstaltungen – gib deine Teilnahme bekannt."
      />
      <EventsPanel />
    </MemberShell>
  );
}
