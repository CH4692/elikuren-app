"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Mitteilungen</CardTitle>
        <CardDescription>
          Aktuelle Hinweise und Ankündigungen vom Vorstand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[#5c574e]">Lädt…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#5c574e]">Keine Mitteilungen.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  item.is_important
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-[#d9d2c4]"
                } ${item.is_read ? "opacity-80" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
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
