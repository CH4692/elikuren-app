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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  is_important: boolean;
  published_at: string | null;
  expires_at: string | null;
  read_count: number;
};

export function AdminAnnouncementsPanel() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    is_important: false,
    expires_at: "",
    publish: false,
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
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

  function createItem() {
    startTransition(async () => {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          is_important: form.is_important,
          expires_at: form.expires_at
            ? new Date(form.expires_at).toISOString()
            : null,
          publish: form.publish,
        }),
      });
      if (!res.ok) {
        toast.error("Mitteilung konnte nicht angelegt werden");
        return;
      }
      toast.success(form.publish ? "Veröffentlicht" : "Entwurf gespeichert");
      setCreating(false);
      setForm({
        title: "",
        body: "",
        is_important: false,
        expires_at: "",
        publish: false,
      });
      await load();
    });
  }

  function publish(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: true }),
      });
      if (!res.ok) {
        toast.error("Veröffentlichen fehlgeschlagen");
        return;
      }
      toast.success("Veröffentlicht");
      await load();
    });
  }

  function remove(id: string) {
    if (!confirm("Mitteilung wirklich löschen?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Löschen fehlgeschlagen");
        return;
      }
      toast.success("Gelöscht");
      await load();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mitteilungen verwalten</CardTitle>
        <CardDescription>
          Ankündigungen erstellen und veröffentlichen.
        </CardDescription>
        <Button
          type="button"
          size="sm"
          className="mt-2 w-fit"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Abbrechen" : "Neue Mitteilung"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {creating ? (
          <div className="rounded-2xl border border-[#d9d2c4] p-4 space-y-3">
            <div>
              <Label htmlFor="ann-title">Titel</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ann-body">Text</Label>
              <Textarea
                id="ann-body"
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ann-expires">Ablauf (optional)</Label>
                <Input
                  id="ann-expires"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) =>
                    setForm({ ...form, expires_at: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end gap-4 pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_important}
                    onChange={(e) =>
                      setForm({ ...form, is_important: e.target.checked })
                    }
                  />
                  Wichtig
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.publish}
                    onChange={(e) =>
                      setForm({ ...form, publish: e.target.checked })
                    }
                  />
                  Sofort veröffentlichen
                </label>
              </div>
            </div>
            <Button
              disabled={pending || !form.title || !form.body}
              onClick={createItem}
            >
              Speichern
            </Button>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#5c574e]">Lädt…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#5c574e]">Keine Mitteilungen.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-[#d9d2c4] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#5c574e]">
                      {item.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {item.published_at ? (
                      <Badge variant="success">Veröffentlicht</Badge>
                    ) : (
                      <Badge variant="warning">Entwurf</Badge>
                    )}
                    <span className="text-xs text-[#5c574e]">
                      {item.read_count} gelesen
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!item.published_at ? (
                    <Button size="sm" disabled={pending} onClick={() => publish(item.id)}>
                      Veröffentlichen
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#cfc8bb] bg-transparent text-red-700"
                    disabled={pending}
                    onClick={() => remove(item.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
