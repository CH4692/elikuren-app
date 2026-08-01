"use client";

import { Check, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { FormDrawer } from "@/components/app/form-drawer";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

function requestName(item: RequestItem) {
  return [item.firstname, item.lastname].filter(Boolean).join(" ") || "Ohne Name";
}

function statusBadge(status: RequestItem["status"]) {
  if (status === "pending") return <Badge variant="warning">Offen</Badge>;
  if (status === "approved") return <Badge variant="success">Freigegeben</Badge>;
  return <Badge variant="danger">Abgelehnt</Badge>;
}

function draftFromItem(item: RequestItem): Draft {
  const voice = item.voice ?? "";
  const known = VOICE_OPTIONS.includes(voice as (typeof VOICE_OPTIONS)[number]);
  return {
    voiceSelect: known ? voice : voice ? "__custom" : "",
    voiceCustom: known ? "" : voice,
    adminNote: item.admin_note ?? "",
  };
}

function resolvedVoice(draft: Draft): string | null {
  if (draft.voiceSelect === "__custom") return draft.voiceCustom.trim() || null;
  return draft.voiceSelect.trim() || null;
}

export function MembershipRequestsPanel() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewing, setReviewing] = useState<RequestItem | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/membership-requests");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: RequestItem[] };
      setItems(data.items);
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

  function openReview(item: RequestItem) {
    setReviewing(item);
    setDraft(draftFromItem(item));
    setDrawerOpen(true);
  }

  function review(status: "approved" | "rejected") {
    if (!reviewing || !draft) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/membership-requests/${reviewing.id}`, {
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
      setDrawerOpen(false);
      setReviewing(null);
      setDraft(null);
      await load();
    });
  }

  return (
    <div>
      <PageHeader
        title="Zugangsanfragen"
        description="Mitgliederfreigaben prüfen: Stimme zuweisen, optional Notiz hinterlegen und Zugang freigeben oder ablehnen."
      />

      <DataTableToolbar
        filters={
          <>
            <Button
              type="button"
              size="sm"
              variant={filter === "pending" ? "default" : "outline"}
              className={
                filter !== "pending" ? "border-[#d9d2c4]" : undefined
              }
              onClick={() => setFilter("pending")}
            >
              Offen
            </Button>
            <Button
              type="button"
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              className={filter !== "all" ? "border-[#d9d2c4]" : undefined}
              onClick={() => setFilter("all")}
            >
              Alle
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={
            filter === "pending"
              ? "Keine offenen Anfragen"
              : "Keine Anfragen vorhanden"
          }
          description="Neue Zugangsanfragen erscheinen hier zur Prüfung."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => (
                <TableRow key={item.id} data-testid="membership-request">
                  <TableCell className="font-medium">
                    {requestName(item)}
                  </TableCell>
                  <TableCell className="text-[#5c574e]">{item.email}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleString("de-DE")}
                  </TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    {item.status === "pending" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4]"
                        onClick={() => openReview(item)}
                      >
                        Prüfen
                      </Button>
                    ) : (
                      <span className="text-sm text-[#5c574e]">
                        {item.voice ?? "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setReviewing(null);
            setDraft(null);
          }
        }}
        title="Anfrage prüfen"
        description={
          reviewing
            ? `${requestName(reviewing)} · ${reviewing.email}`
            : undefined
        }
        footer={
          draft ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setDrawerOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-[#d9d2c4] text-red-700"
                disabled={pending}
                onClick={() => review("rejected")}
              >
                <X className="size-3.5" />
                Ablehnen
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() => review("approved")}
              >
                <Check className="size-3.5" />
                Freigeben
              </Button>
            </>
          ) : undefined
        }
      >
        {reviewing && draft ? (
          <div className="space-y-4">
            {reviewing.message ? (
              <div className="rounded-xl border border-[#ebe4d8] bg-white/80 p-3 text-sm">
                <p className="mb-1 font-medium">Nachricht</p>
                <p className="text-[#5c574e]">{reviewing.message}</p>
              </div>
            ) : null}
            <div>
              <Label htmlFor="req-voice">Stimmgruppe</Label>
              <select
                id="req-voice"
                className={selectClass}
                value={draft.voiceSelect}
                onChange={(e) =>
                  setDraft({ ...draft, voiceSelect: e.target.value })
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
                  onChange={(e) =>
                    setDraft({ ...draft, voiceCustom: e.target.value })
                  }
                />
              ) : null}
            </div>
            <div>
              <Label htmlFor="req-note">Interne Notiz (optional)</Label>
              <Textarea
                id="req-note"
                rows={2}
                value={draft.adminNote}
                onChange={(e) =>
                  setDraft({ ...draft, adminNote: e.target.value })
                }
              />
            </div>
            <p className="text-xs text-[#5c574e]">
              Nach Freigabe erhält die Person eine Info-E-Mail mit Link zur
              Login-Seite (kein automatischer Magic Link).
            </p>
          </div>
        ) : null}
      </FormDrawer>
    </div>
  );
}
