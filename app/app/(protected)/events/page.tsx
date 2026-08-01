import { MemberPageIntro } from "@/components/app/member-page-intro";
import { MemberShell } from "@/components/app/member-shell";
import { EventsPanel } from "@/components/events/events-panel";

export default function EventsPage() {
  return (
    <MemberShell>
      <MemberPageIntro
        title="Termine"
        description="Proben, Auftritte und Veranstaltungen – gib deine Teilnahme bekannt."
      />
      <EventsPanel />
    </MemberShell>
  );
}
