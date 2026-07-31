"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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

type MemberItem = {
  id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  voice: string | null;
  role: string;
  is_active: boolean;
  member_since: string | null;
  last_signed_in: string | null;
};

type Draft = {
  role: string;
  voice: string;
  isActive: boolean;
};

const ROLES = ["mitglied", "vorstand", "kassenwart", "kassenpruefer"] as const;
const VOICE_OPTIONS = ["Sopran", "Alt", "Tenor", "Bass"] as const;

function draftFromItem(item: MemberItem): Draft {
  return {
    role: item.role,
    voice: item.voice ?? "",
    isActive: item.is_active,
  };
}

function statusBadge(active: boolean) {
  return active ? (
    <Badge variant="success">Aktiv</Badge>
  ) : (
    <Badge variant="danger">Inaktiv</Badge>
  );
}

export function MembersPanel() {
  const [items, setItems] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/members${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: MemberItem[] };
      setItems(data.items);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const item of data.items) {
          if (!next[item.id]) next[item.id] = draftFromItem(item);
        }
        return next;
      });
    } catch {
      toast.error("Mitglieder konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    return [...items].sort((a, b) => {
      const an = `${a.lastname ?? ""} ${a.firstname ?? ""}`.trim();
      const bn = `${b.lastname ?? ""} ${b.firstname ?? ""}`.trim();
      return an.localeCompare(bn, "de");
    });
  }, [items]);

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? draftFromItem(items.find((i) => i.id === id)!)), ...patch },
    }));
  }

  function save(id: string) {
    const item = items.find((entry) => entry.id === id);
    const draft = drafts[id] ?? (item ? draftFromItem(item) : null);
    if (!item || !draft) return;

    const patch: Record<string, unknown> = {};
    if (draft.role !== item.role) patch.role = draft.role;
    if (draft.voice !== (item.voice ?? "")) patch.voice = draft.voice.trim() || null;
    if (draft.isActive !== item.is_active) patch.is_active = draft.isActive;

    if (Object.keys(patch).length === 0) {
      toast.message("Keine Änderungen");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        toast.error("Speichern fehlgeschlagen");
        return;
      }
      toast.success("Mitglied aktualisiert");
      await load(search || undefined);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mitglieder</CardTitle>
        <CardDescription>
          Rollen, Stimmen und Aktivstatus verwalten. Rollenänderungen erfordern
          entsprechende Berechtigung.
        </CardDescription>
        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query);
            void load(query || undefined);
          }}
        >
          <Input
            placeholder="Suche nach Name, E-Mail, Stimme…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit" size="sm" variant="outline" className="border-[#cfc8bb] bg-transparent">
            Suchen
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[#5c574e]">Lädt…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-[#5c574e]">Keine Mitglieder gefunden.</p>
        ) : (
          <ul className="space-y-4">
            {visible.map((item) => {
              const draft = drafts[item.id] ?? draftFromItem(item);
              const changed =
                draft.role !== item.role ||
                draft.voice !== (item.voice ?? "") ||
                draft.isActive !== item.is_active;

              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[#d9d2c4] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1f1f23]">
                        {[item.firstname, item.lastname]
                          .filter(Boolean)
                          .join(" ") || "Ohne Name"}
                      </p>
                      <p className="text-sm text-[#5c574e]">{item.email}</p>
                      {item.last_signed_in ? (
                        <p className="mt-1 text-xs text-[#5c574e]">
                          Zuletzt angemeldet:{" "}
                          {new Date(item.last_signed_in).toLocaleString("de-DE")}
                        </p>
                      ) : null}

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <Label htmlFor={`role-${item.id}`}>Rolle</Label>
                          <select
                            id={`role-${item.id}`}
                            className="flex h-11 w-full rounded-xl border border-[#cfc8bb] bg-[#f7f4ee] px-3 py-2 text-sm"
                            value={draft.role}
                            onChange={(e) =>
                              updateDraft(item.id, { role: e.target.value })
                            }
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`voice-${item.id}`}>Stimme</Label>
                          <select
                            id={`voice-${item.id}`}
                            className="flex h-11 w-full rounded-xl border border-[#cfc8bb] bg-[#f7f4ee] px-3 py-2 text-sm"
                            value={
                              VOICE_OPTIONS.includes(
                                draft.voice as (typeof VOICE_OPTIONS)[number],
                              )
                                ? draft.voice
                                : draft.voice
                                  ? "__custom"
                                  : ""
                            }
                            onChange={(e) => {
                              const v = e.target.value;
                              updateDraft(item.id, {
                                voice: v === "__custom" ? draft.voice : v,
                              });
                            }}
                          >
                            <option value="">—</option>
                            {VOICE_OPTIONS.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                            <option value="__custom">Andere…</option>
                          </select>
                          {!VOICE_OPTIONS.includes(
                            draft.voice as (typeof VOICE_OPTIONS)[number],
                          ) &&
                          draft.voice ? (
                            <Input
                              className="mt-2"
                              value={draft.voice}
                              onChange={(e) =>
                                updateDraft(item.id, { voice: e.target.value })
                              }
                            />
                          ) : null}
                        </div>
                        <div>
                          <Label htmlFor={`active-${item.id}`}>Status</Label>
                          <select
                            id={`active-${item.id}`}
                            className="flex h-11 w-full rounded-xl border border-[#cfc8bb] bg-[#f7f4ee] px-3 py-2 text-sm"
                            value={draft.isActive ? "active" : "inactive"}
                            onChange={(e) =>
                              updateDraft(item.id, {
                                isActive: e.target.value === "active",
                              })
                            }
                          >
                            <option value="active">Aktiv</option>
                            <option value="inactive">Inaktiv</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {statusBadge(item.is_active)}
                      <Button
                        size="sm"
                        disabled={pending || !changed}
                        onClick={() => save(item.id)}
                      >
                        Speichern
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
