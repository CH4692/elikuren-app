"use client";

import { Globe } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { FormDrawer } from "@/components/app/form-drawer";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type SiteSection = {
  id: string;
  key: string;
  is_visible: boolean;
  data: Record<string, unknown>;
  valid: boolean;
  error: string | null;
  updated_at: string;
};

type SitePage = {
  id: string;
  key: string;
  title: string;
  sections: SiteSection[];
};

/** Hand-built admin forms — Zod validates on the server only. */
export function SiteContentPanel() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<{
    pageKey: string;
    section: SiteSection;
  } | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(true);
  const [pending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { pages: SitePage[] };
      setPages(data.pages);
    } catch {
      toast.error("Website-Inhalte konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openEdit(pageKey: string, section: SiteSection) {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(section.data ?? {})) {
      next[key] = typeof value === "string" ? value : String(value ?? "");
    }
    setDraft(next);
    setVisible(section.is_visible);
    setEdit({ pageKey, section });
  }

  function save() {
    if (!edit) return;
    startTransition(async () => {
      const res = await fetch(
        `/api/admin/site/${edit.pageKey}/${edit.section.key}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: draft, isVisible: visible }),
        },
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        toast.error(err.detail ?? "Speichern fehlgeschlagen");
        return;
      }
      toast.success("Sektion gespeichert");
      setEdit(null);
      await load();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website"
        description="Feste Sektionen bearbeiten. Zod validiert serverseitig — keine Form-Generatoren."
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Keine Seiten"
          description="Seeds legen die Standard-Sektionen an."
        />
      ) : (
        pages.map((page) => (
          <section key={page.id} className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1f1f23]">
              {page.title}{" "}
              <span className="text-sm font-normal text-[#8a8478]">
                ({page.key})
              </span>
            </h2>
            <ul className="divide-y divide-[#ebe4d8] rounded-2xl border border-[#d9d2c4] bg-white">
              {page.sections.map((section) => (
                <li
                  key={section.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#1f1f23]">{section.key}</p>
                    <p className="text-xs text-[#8a8478]">
                      {section.updated_at.slice(0, 16).replace("T", " ")}
                    </p>
                    {!section.valid && section.error ? (
                      <p className="mt-1 text-xs text-red-700">
                        {section.error}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={section.is_visible ? "default" : "secondary"}>
                      {section.is_visible ? "sichtbar" : "versteckt"}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(page.key, section)}
                    >
                      Bearbeiten
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <FormDrawer
        open={Boolean(edit)}
        onOpenChange={(open) => {
          if (!open) setEdit(null);
        }}
        title={edit ? `Sektion ${edit.section.key}` : "Sektion"}
        description="Felder der festen Zod-Sektion."
        loading={pending}
        onSubmit={save}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="sec-visible"
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="size-4 rounded border-[#d9d2c4]"
            />
            <Label htmlFor="sec-visible">Auf Website sichtbar</Label>
          </div>
          {Object.keys(draft).map((key) => {
            const value = draft[key] ?? "";
            const multiline = value.length > 80 || key.includes("body");
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`sec-${key}`}>{key}</Label>
                {multiline ? (
                  <Textarea
                    id={`sec-${key}`}
                    value={value}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    rows={4}
                  />
                ) : (
                  <Input
                    id={`sec-${key}`}
                    value={value}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </FormDrawer>
    </div>
  );
}
