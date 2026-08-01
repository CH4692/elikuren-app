"use client";

import { Megaphone } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  is_important: boolean;
  published_at: string | null;
  expires_at: string | null;
  is_read: boolean;
  read_at: string | null;
};

export function AnnouncementsPanel() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: AnnouncementItem[] };
      setItems(data.items);
    } catch {
      toast.error("Mitteilungen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function markRead(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/announcements/${id}/read`, {
        method: "POST",
      });
      if (!res.ok) {
        toast.error("Konnte nicht als gelesen markiert werden");
        return;
      }
      await load();
    });
  }

  return (
    <Card className="border-[#ebe4d8] bg-white/80">
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Keine Mitteilungen"
            description="Sobald der Vorstand etwas veröffentlicht, erscheint es hier."
          />
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  item.is_important
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-[#ebe4d8] bg-white/60"
                } ${item.is_read ? "opacity-80" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#1f1f23]">{item.title}</p>
                    {item.published_at ? (
                      <p className="text-xs text-[#5c574e]">
                        {new Date(item.published_at).toLocaleString("de-DE")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {item.is_important ? (
                      <Badge variant="warning">Wichtig</Badge>
                    ) : null}
                    {item.is_read ? (
                      <Badge variant="success">Gelesen</Badge>
                    ) : (
                      <Badge variant="default">Neu</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                  {item.body}
                </p>
                {!item.is_read ? (
                  <Button
                    size="sm"
                    className="mt-3"
                    disabled={pending}
                    onClick={() => markRead(item.id)}
                  >
                    Als gelesen markieren
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
