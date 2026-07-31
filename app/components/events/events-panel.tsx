"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type EventItem = {
  id: string;
  title: string;
  type: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  description: string | null;
  rsvp_deadline: string | null;
  my_response: { status: string; note: string | null } | null;
};

const TYPE_LABELS: Record<string, string> = {
  REHEARSAL: "Probe",
  SPECIAL_REHEARSAL: "Sonderprobe",
  GENERAL_REHEARSAL: "Generalprobe",
  CONCERT: "Konzert",
  SERVICE: "Gottesdienst",
  PERFORMANCE: "Auftritt",
  OTHER: "Sonstiges",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rsvpBadge(status: string | null) {
  if (status === "YES") return <Badge variant="success">Zusage</Badge>;
  if (status === "NO") return <Badge variant="danger">Absage</Badge>;
  if (status === "MAYBE") return <Badge variant="warning">Vielleicht</Badge>;
  return <Badge variant="default">Offen</Badge>;
}

export function EventsPanel() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: EventItem[] };
      setItems(data.items);
    } catch {
      toast.error("Termine konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const item of items) {
      const key = item.starts_at.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  function rsvp(eventId: string, status: "YES" | "NO" | "MAYBE") {
    startTransition(async () => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Rückmeldung fehlgeschlagen");
        return;
      }
      toast.success("Rückmeldung gespeichert");
      await load();
    });
  }

  return (
    <Card className="border-[#ebe4d8] bg-white/80">
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Keine Termine"
            description="Aktuell sind keine Termine eingetragen."
          />
        ) : (
          <div className="space-y-8">
            {grouped.map(([month, events]) => (
              <section key={month}>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#5c574e]">
                  {new Date(`${month}-01`).toLocaleDateString("de-DE", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <ul className="space-y-3">
                  {events.map((event) => {
                    const pastDeadline =
                      event.rsvp_deadline &&
                      new Date() > new Date(event.rsvp_deadline);
                    return (
                      <li
                        key={event.id}
                        className="rounded-2xl border border-[#ebe4d8] bg-white/60 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-[#1f1f23]">
                              {event.title}
                            </p>
                            <p className="text-sm text-[#5c574e]">
                              {TYPE_LABELS[event.type] ?? event.type} ·{" "}
                              {formatDate(event.starts_at)}
                            </p>
                            {event.location ? (
                              <p className="text-sm text-[#5c574e]">
                                {event.location}
                              </p>
                            ) : null}
                            {event.description ? (
                              <p className="mt-2 text-sm leading-6">
                                {event.description}
                              </p>
                            ) : null}
                          </div>
                          {rsvpBadge(event.my_response?.status ?? null)}
                        </div>
                        {!pastDeadline ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={
                                event.my_response?.status === "YES"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                event.my_response?.status !== "YES"
                                  ? "border-[#ebe4d8] bg-transparent"
                                  : undefined
                              }
                              disabled={pending}
                              onClick={() => rsvp(event.id, "YES")}
                            >
                              Zusage
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                event.my_response?.status === "MAYBE"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                event.my_response?.status !== "MAYBE"
                                  ? "border-[#ebe4d8] bg-transparent"
                                  : undefined
                              }
                              disabled={pending}
                              onClick={() => rsvp(event.id, "MAYBE")}
                            >
                              Vielleicht
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                event.my_response?.status === "NO"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                event.my_response?.status !== "NO"
                                  ? "border-[#ebe4d8] bg-transparent"
                                  : undefined
                              }
                              disabled={pending}
                              onClick={() => rsvp(event.id, "NO")}
                            >
                              Absage
                            </Button>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-[#5c574e]">
                            RSVP-Frist abgelaufen
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
