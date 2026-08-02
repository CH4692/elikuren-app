"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/app/confirm-dialog";
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
import { MEMBER_VOICE_OPTIONS as VOICE_OPTIONS } from "@/lib/voice-options";

type MemberItem = {
  id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  location: string | null;
  voice: string | null;
  role: string;
  is_active: boolean;
  member_since: string | null;
  last_signed_in: string | null;
};

type MemberDraft = {
  role: string;
  voice: string;
  voiceSelect: string;
  isActive: boolean;
  firstname: string;
  lastname: string;
  phone: string;
  street: string;
  house_number: string;
  postal_code: string;
  location: string;
};

const ROLES = ["mitglied", "vorstand", "kassenwart", "kassenpruefer"] as const;
const selectClass =
  "flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]";

function memberName(item: MemberItem) {
  return [item.firstname, item.lastname].filter(Boolean).join(" ") || "Ohne Name";
}

function draftFromItem(item: MemberItem): MemberDraft {
  const voice = item.voice ?? "";
  const known = VOICE_OPTIONS.includes(voice as (typeof VOICE_OPTIONS)[number]);
  return {
    role: item.role,
    voice,
    voiceSelect: known ? voice : voice ? "__custom" : "",
    isActive: item.is_active,
    firstname: item.firstname ?? "",
    lastname: item.lastname ?? "",
    phone: item.phone ?? "",
    street: item.street ?? "",
    house_number: item.house_number ?? "",
    postal_code: item.postal_code ?? "",
    location: item.location ?? "",
  };
}

function resolvedVoice(draft: MemberDraft): string | null {
  if (draft.voiceSelect === "__custom") return draft.voice.trim() || null;
  return draft.voiceSelect.trim() || null;
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
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MemberItem | null>(null);
  const [draft, setDraft] = useState<MemberDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemberItem | null>(null);

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/members${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: MemberItem[] };
      setItems(data.items);
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
    return [...items].sort((a, b) =>
      memberName(a).localeCompare(memberName(b), "de"),
    );
  }, [items]);

  function openEdit(item: MemberItem) {
    setEditing(item);
    setDraft(draftFromItem(item));
    setDrawerOpen(true);
  }

  function save() {
    if (!editing || !draft) return;

    const patch: Record<string, unknown> = {};
    if (draft.role !== editing.role) patch.role = draft.role;
    const voice = resolvedVoice(draft);
    if (voice !== (editing.voice ?? "")) patch.voice = voice;
    if (draft.isActive !== editing.is_active) patch.is_active = draft.isActive;
    if (draft.firstname.trim() !== (editing.firstname ?? ""))
      patch.firstname = draft.firstname.trim() || null;
    if (draft.lastname.trim() !== (editing.lastname ?? ""))
      patch.lastname = draft.lastname.trim() || null;
    if (draft.phone.trim() !== (editing.phone ?? ""))
      patch.phone = draft.phone.trim() || null;
    if (draft.street.trim() !== (editing.street ?? ""))
      patch.street = draft.street.trim() || null;
    if (draft.house_number.trim() !== (editing.house_number ?? ""))
      patch.house_number = draft.house_number.trim() || null;
    if (draft.postal_code.trim() !== (editing.postal_code ?? ""))
      patch.postal_code = draft.postal_code.trim() || null;
    if (draft.location.trim() !== (editing.location ?? ""))
      patch.location = draft.location.trim() || null;

    if (Object.keys(patch).length === 0) {
      toast.message("Keine Änderungen");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/members/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        toast.error("Speichern fehlgeschlagen");
        return;
      }
      toast.success("Mitglied aktualisiert");
      setDrawerOpen(false);
      setEditing(null);
      setDraft(null);
      await load(search || undefined);
    });
  }

  return (
    <div>
      <PageHeader
        title="Mitglieder"
        description="Rollen, Stimmen, Profildaten und Aktivstatus verwalten — inkl. Löschen."
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Name, E-Mail, Stimme…"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void load(search || undefined)}
          >
            Suchen
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Keine Mitglieder gefunden"
          description="Passe die Suche an oder lege neue Mitglieder über Zugangsanfragen an."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Stimme</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{memberName(item)}</TableCell>
                  <TableCell className="text-[#5c574e]">{item.email}</TableCell>
                  <TableCell>{item.voice ?? "—"}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{statusBadge(item.is_active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 font-medium text-[#1f1f23]"
                        onClick={() => openEdit(item)}
                        aria-label={`${memberName(item)} bearbeiten`}
                      >
                        <Pencil className="size-3.5 text-[#C8A24D]" />
                        Bearbeiten
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4] text-red-700"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`${memberName(item)} löschen`}
                      >
                        <Trash2 className="size-3.5" />
                        Löschen
                      </Button>
                    </div>
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
            setEditing(null);
            setDraft(null);
          }
        }}
        title="Mitglied bearbeiten"
        description={editing ? `${memberName(editing)} · ${editing.email}` : undefined}
        loading={pending}
        onSubmit={save}
      >
        {draft ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="mem-firstname">Vorname</Label>
                <Input
                  id="mem-firstname"
                  value={draft.firstname}
                  onChange={(e) =>
                    setDraft({ ...draft, firstname: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mem-lastname">Nachname</Label>
                <Input
                  id="mem-lastname"
                  value={draft.lastname}
                  onChange={(e) =>
                    setDraft({ ...draft, lastname: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mem-phone">Telefon</Label>
              <Input
                id="mem-phone"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="mem-street">Straße</Label>
                <Input
                  id="mem-street"
                  value={draft.street}
                  onChange={(e) =>
                    setDraft({ ...draft, street: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mem-house">Nr.</Label>
                <Input
                  id="mem-house"
                  value={draft.house_number}
                  onChange={(e) =>
                    setDraft({ ...draft, house_number: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="mem-plz">PLZ</Label>
                <Input
                  id="mem-plz"
                  value={draft.postal_code}
                  onChange={(e) =>
                    setDraft({ ...draft, postal_code: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mem-location">Ort</Label>
                <Input
                  id="mem-location"
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="mem-role">Rolle</Label>
                <select
                  id="mem-role"
                  className={selectClass}
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="mem-voice">Stimme</Label>
                <select
                  id="mem-voice"
                  className={selectClass}
                  value={draft.voiceSelect}
                  onChange={(e) =>
                    setDraft({ ...draft, voiceSelect: e.target.value })
                  }
                >
                  <option value="">—</option>
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="__custom">Andere…</option>
                </select>
                {draft.voiceSelect === "__custom" ? (
                  <Input
                    className="mt-2"
                    value={draft.voice}
                    onChange={(e) =>
                      setDraft({ ...draft, voice: e.target.value })
                    }
                  />
                ) : null}
              </div>
            </div>
            <div>
              <Label htmlFor="mem-active">Status</Label>
              <select
                id="mem-active"
                className={selectClass}
                value={draft.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    isActive: e.target.value === "active",
                  })
                }
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </div>
          </div>
        ) : null}
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Mitglied löschen?"
        description={
          deleteTarget
            ? `„${memberName(deleteTarget)}“ (${deleteTarget.email ?? "ohne E-Mail"}) wird dauerhaft entfernt. Sessions und Favoriten entfallen mit.`
            : undefined
        }
        confirmLabel="Löschen"
        destructive
        loading={pending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const res = await fetch(`/api/admin/members/${deleteTarget.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              const err = (await res.json().catch(() => ({}))) as {
                detail?: string;
              };
              toast.error(err.detail ?? "Löschen fehlgeschlagen");
              return;
            }
            toast.success("Mitglied gelöscht");
            setDeleteTarget(null);
            if (editing?.id === deleteTarget.id) {
              setDrawerOpen(false);
              setEditing(null);
              setDraft(null);
            }
            await load(search || undefined);
          });
        }}
      />
    </div>
  );
}
