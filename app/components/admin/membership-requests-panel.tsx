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
import { Textarea } from "@/components/ui/textarea";

type RequestItem = {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  message: string | null;
  voice: string | null;
  admin_note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type Draft = {
  voiceSelect: string;
  voiceCustom: string;
  adminNote: string;
};

const VOICE_OPTIONS = ["Sopran", "Alt", "Tenor", "Bass"] as const;

function statusBadge(status: RequestItem["status"]) {
  if (status === "pending") return <Badge variant="warning">Offen</Badge>;
  if (status === "approved") return <Badge variant="success">Freigegeben</Badge>;
  return <Badge variant="danger">Abgelehnt</Badge>;
}

function draftFromItem(item: RequestItem): Draft {
  const voice = item.voice ?? "";
  const known = VOICE_OPTIONS.includes(
    voice as (typeof VOICE_OPTIONS)[number],
  );
  return {
    voiceSelect: known ? voice : voice ? "__custom" : "",
    voiceCustom: known ? "" : voice,
    adminNote: item.admin_note ?? "",
  };
}

function resolvedVoice(draft: Draft): string | null {
  if (draft.voiceSelect === "__custom") {
    return draft.voiceCustom.trim() || null;
  }
  return draft.voiceSelect.trim() || null;
}

export function MembershipRequestsPanel() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/membership-requests");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: RequestItem[] };
      setItems(data.items);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const item of data.items) {
          if (!next[item.id]) next[item.id] = draftFromItem(item);
        }
        return next;
      });
    } catch {
      toast.error("Anfragen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const list =
      filter === "pending"
        ? items.filter((item) => item.status === "pending")
        : items;
    return [...list].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [items, filter]);

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? draftFromItem(items.find((i) => i.id === id)!)), ...patch },
    }));
  }

  function review(id: string, status: "approved" | "rejected") {
    const item = items.find((entry) => entry.id === id);
    const draft = drafts[id] ?? (item ? draftFromItem(item) : null);
    if (!draft) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/membership-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          voice: resolvedVoice(draft),
          adminNote: draft.adminNote.trim() || null,
        }),
      });
      if (!res.ok) {
        toast.error("Aktion fehlgeschlagen");
        return;
      }
      const data = (await res.json()) as { approval_email_sent?: boolean };
      toast.success(
        status === "approved"
          ? data.approval_email_sent
            ? "Freigegeben – Info-E-Mail gesendet"
            : "Freigegeben"
          : "Anfrage abgelehnt",
      );
      await load();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zugangsanfragen</CardTitle>
        <CardDescription>
          Mitgliederfreigaben prüfen: Stimme zuweisen, optional Notiz hinterlegen
          und Zugang freigeben oder ablehnen. Magic Links sind erst nach
          Freigabe möglich.
        </CardDescription>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant={filter === "pending" ? "default" : "outline"}
            className={
              filter !== "pending"
                ? "border-[#cfc8bb] bg-transparent text-[#1f1f23] hover:bg-[#efe9df]"
                : undefined
            }
            onClick={() => setFilter("pending")}
          >
            Offen
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            className={
              filter !== "all"
                ? "border-[#cfc8bb] bg-transparent text-[#1f1f23] hover:bg-[#efe9df]"
                : undefined
            }
            onClick={() => setFilter("all")}
          >
            Alle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[#5c574e]">Lädt…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-[#5c574e]">
            {filter === "pending"
              ? "Keine offenen Anfragen."
              : "Keine Anfragen vorhanden."}
          </p>
        ) : (
          <ul className="space-y-4">
            {visible.map((item) => {
              const draft = drafts[item.id] ?? draftFromItem(item);
              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-[#d9d2c4] p-4"
                  data-testid="membership-request"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1f1f23]">
                        {[item.firstname, item.lastname]
                          .filter(Boolean)
                          .join(" ") || "Ohne Name"}
                      </p>
                      <p className="text-sm text-[#5c574e]">{item.email}</p>
                      {item.message ? (
                        <p className="mt-2 text-sm leading-6 text-[#2a2a2e]">
                          {item.message}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-[#5c574e]">
                        {new Date(item.created_at).toLocaleString("de-DE")}
                      </p>

                      {item.status === "pending" ? (
                        <div className="mt-4 space-y-3">
                          <div>
                            <Label htmlFor={`voice-${item.id}`}>
                              Stimmgruppe
                            </Label>
                            <select
                              id={`voice-${item.id}`}
                              className="flex h-11 w-full rounded-xl border border-[#cfc8bb] bg-[#f7f4ee] px-3 py-2 text-sm text-[#1f1f23]"
                              value={draft.voiceSelect}
                              onChange={(event) =>
                                updateDraft(item.id, {
                                  voiceSelect: event.target.value,
                                })
                              }
                            >
                              <option value="">Bitte wählen</option>
                              {VOICE_OPTIONS.map((voice) => (
                                <option key={voice} value={voice}>
                                  {voice}
                                </option>
                              ))}
                              <option value="__custom">Andere…</option>
                            </select>
                            {draft.voiceSelect === "__custom" ? (
                              <Input
                                className="mt-2"
                                placeholder="Stimmgruppe"
                                value={draft.voiceCustom}
                                onChange={(event) =>
                                  updateDraft(item.id, {
                                    voiceCustom: event.target.value,
                                  })
                                }
                              />
                            ) : null}
                          </div>
                          <div>
                            <Label htmlFor={`note-${item.id}`}>
                              Interne Notiz (optional)
                            </Label>
                            <Textarea
                              id={`note-${item.id}`}
                              rows={2}
                              value={draft.adminNote}
                              onChange={(event) =>
                                updateDraft(item.id, {
                                  adminNote: event.target.value,
                                })
                              }
                            />
                          </div>
                          <p className="text-xs text-[#5c574e]">
                            Nach Freigabe erhält die Person eine Info-E-Mail mit
                            Link zur Login-Seite (kein automatischer Magic Link).
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-1 text-sm text-[#5c574e]">
                          {item.voice ? <p>Stimme: {item.voice}</p> : null}
                          {item.admin_note ? (
                            <p>Notiz: {item.admin_note}</p>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {statusBadge(item.status)}
                      {item.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() => review(item.id, "approved")}
                          >
                            Freigeben
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#cfc8bb] bg-transparent text-[#1f1f23] hover:bg-[#efe9df]"
                            disabled={pending}
                            onClick={() => review(item.id, "rejected")}
                          >
                            Ablehnen
                          </Button>
                        </div>
                      ) : null}
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
