"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { CmsImageField } from "@/components/admin/cms/cms-image-field";
import { CmsPageHeader } from "@/components/admin/cms/cms-page-header";
import { CmsSaveBar } from "@/components/admin/cms/cms-save-bar";
import { CmsSection } from "@/components/admin/cms/cms-section";
import { CmsSectionForm } from "@/components/admin/cms/cms-section-form";
import { cmsSectionHelp } from "@/components/admin/cms/cms-section-help";
import { CmsTextInput } from "@/components/admin/cms/cms-text-input";
import { CmsVisibilitySwitch } from "@/components/admin/cms/cms-visibility-switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminSitePageView } from "@/lib/site-content";
import {
  getGlobalSectionDefinition,
  getPublicSitePageDefinition,
  getSectionDef,
  previewPathForPageKey,
} from "@/lib/site-content/defaults";
import { cmsValuesEqual } from "@/lib/site-content/normalize";
import { isKnownSitePageKey } from "@/lib/site-content/registry";

type EditableSection = {
  key: string;
  data: Record<string, unknown>;
  isVisible: boolean;
  visibilityMode: "fixed" | "toggleable";
  label: string;
  valid: boolean;
  error: string | null;
};

type EditableState = {
  description: string;
  metaTitle: string;
  metaDescription: string;
  ogImageId: string | null;
  sections: EditableSection[];
};

function toEditable(page: AdminSitePageView): EditableState {
  return {
    description: page.description ?? "",
    metaTitle: page.meta_title ?? "",
    metaDescription: page.meta_description ?? "",
    ogImageId: page.og_image_id,
    sections: page.sections.map((section) => {
      const def = getSectionDef(page.key, section.key);
      return {
        key: section.key,
        data: { ...(section.data as Record<string, unknown>) },
        isVisible: section.is_visible,
        visibilityMode: section.visibilityMode,
        label: def?.label ?? section.key,
        valid: section.valid,
        error: section.error,
      };
    }),
  };
}

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function CmsPageEditor({
  pageKey,
  mode = "page",
  sectionKey,
}: {
  pageKey: string;
  mode?: "page" | "global";
  /** When mode=global, only this section is edited/saved. */
  sectionKey?: string;
}) {
  const [page, setPage] = useState<AdminSitePageView | null>(null);
  const [draft, setDraft] = useState<EditableState | null>(null);
  const baselineRef = useRef<EditableState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const dirty = useMemo(() => {
    if (!draft || !baselineRef.current) return false;
    return !cmsValuesEqual(draft, baselineRef.current);
  }, [draft]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!dirty) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      const ok = window.confirm(
        "Es gibt ungespeicherte Änderungen. Seite wirklich verlassen?",
      );
      if (!ok) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/admin/site/pages/${pageKey}`);
        if (!res.ok) {
          setLoadError(
            res.status === 404
              ? isKnownSitePageKey(pageKey)
                ? "Seite konnte nicht geladen werden"
                : "Unbekannte Seite"
              : "Seite konnte nicht geladen werden",
          );
          return;
        }
        const data = (await res.json()) as AdminSitePageView;
        let editable = toEditable(data);
        if (mode === "global" && sectionKey) {
          editable = {
            ...editable,
            sections: editable.sections.filter((s) => s.key === sectionKey),
          };
          if (editable.sections.length === 0) {
            setLoadError("Abschnitt nicht gefunden");
            return;
          }
        }
        setPage(data);
        setDraft(editable);
        baselineRef.current = structuredClone(editable);
      } catch {
        setLoadError("Seite konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    })();
  }, [pageKey, mode, sectionKey]);

  async function save() {
    if (!draft || !page) return;
    setSaving(true);
    try {
      const body =
        mode === "global"
          ? {
              sections: draft.sections.map((s) => ({
                key: s.key,
                data: s.data,
                isVisible: s.isVisible,
              })),
            }
          : {
              description: draft.description,
              metaTitle: draft.metaTitle,
              metaDescription: draft.metaDescription,
              ogImageId: draft.ogImageId,
              sections: draft.sections.map((s) => ({
                key: s.key,
                data: s.data,
                isVisible: s.isVisible,
              })),
            };

      const res = await fetch(`/api/admin/site/pages/${pageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(err?.detail || "Speichern fehlgeschlagen");
      }
      const updated = (await res.json()) as AdminSitePageView;
      let next = toEditable(updated);
      if (mode === "global" && sectionKey) {
        next = {
          ...next,
          sections: next.sections.filter((s) => s.key === sectionKey),
        };
      }
      setPage(updated);
      setDraft(next);
      baselineRef.current = structuredClone(next);
      toast.success("Gespeichert");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Speichern fehlgeschlagen",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (loadError || !page || !draft) {
    return (
      <p className="text-sm text-[#a94442]" role="alert">
        {loadError || "Unbekannter Fehler"}
      </p>
    );
  }

  const publicDef = getPublicSitePageDefinition(pageKey);
  const globalDef =
    mode === "global" && sectionKey
      ? getGlobalSectionDefinition(sectionKey)
      : null;
  const activeSection = mode === "global" ? draft.sections[0] : null;
  const title =
    mode === "global"
      ? (globalDef?.title ?? activeSection?.label ?? "Globaler Inhalt")
      : (publicDef?.title ?? page.title);
  const description =
    mode === "global"
      ? globalDef?.adminDescription ||
        cmsSectionHelp(pageKey, sectionKey ?? "") ||
        "Globale Website-Inhalte bearbeiten"
      : page.description?.trim() ||
        publicDef?.adminDescription ||
        undefined;

  const breadcrumb =
    mode === "global"
      ? [
          { label: "Website", href: "/admin/site" },
          { label: "Globale Inhalte", href: "/admin/site" },
          { label: title },
        ]
      : [
          { label: "Website", href: "/admin/site" },
          { label: "Seiten", href: "/admin/site" },
          { label: title },
        ];

  const previewPath = previewPathForPageKey(pageKey);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <CmsPageHeader
        breadcrumb={breadcrumb}
        title={title}
        description={description}
        status={
          <span>
            Live · zuletzt geändert {formatUpdated(page.last_updated)}
          </span>
        }
        actions={
          <>
            {previewPath ? (
              <Button asChild variant="outline" className="border-[#d9d2c4]">
                <a href={previewPath} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Vorschau
                </a>
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={!dirty || saving}
              onClick={() => void save()}
            >
              {saving ? "Speichern…" : "Speichern"}
            </Button>
          </>
        }
      />

      {mode === "page" ? (
        <CmsSection
          title="Seitenbeschreibung"
          description="Interne Beschreibung für die Admin-Übersicht (nicht die SEO-Meta-Description)."
        >
          <CmsTextInput
            id="page-description"
            label="Admin-Beschreibung"
            multiline
            rows={2}
            value={draft.description}
            onChange={(v) => setDraft({ ...draft, description: v })}
          />
        </CmsSection>
      ) : null}

      {draft.sections.map((section) => (
        <CmsSection
          key={section.key}
          title={section.label}
          description={cmsSectionHelp(pageKey, section.key)}
          actions={
            section.visibilityMode === "toggleable" ? (
              <CmsVisibilitySwitch
                id={`visible-${section.key}`}
                checked={section.isVisible}
                onChange={(next) =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.map((s) =>
                      s.key === section.key ? { ...s, isVisible: next } : s,
                    ),
                  })
                }
              />
            ) : undefined
          }
        >
          {!section.valid && section.error ? (
            <p className="mb-3 text-sm text-[#a94442]" role="alert">
              Gespeicherte Daten ungültig: {section.error}
            </p>
          ) : null}
          <CmsSectionForm
            pageKey={pageKey}
            sectionKey={section.key}
            data={section.data}
            onChange={(nextData) =>
              setDraft({
                ...draft,
                sections: draft.sections.map((s) =>
                  s.key === section.key ? { ...s, data: nextData } : s,
                ),
              })
            }
          />
        </CmsSection>
      ))}

      {mode === "page" ? (
        <CmsSection
          title="SEO"
          description="Meta-Angaben für Suchmaschinen und Social Previews. Die Admin-Beschreibung oben ist davon getrennt."
        >
          <CmsTextInput
            id="metaTitle"
            label="Meta-Titel"
            value={draft.metaTitle}
            onChange={(v) => setDraft({ ...draft, metaTitle: v })}
            hint="Empfohlen ca. 50–60 Zeichen. Leer = Seititel der Website."
          />
          <CmsTextInput
            id="metaDescription"
            label="Meta-Description"
            multiline
            value={draft.metaDescription}
            onChange={(v) => setDraft({ ...draft, metaDescription: v })}
            hint="Empfohlen ca. 150–160 Zeichen."
          />
          <CmsImageField
            id="ogImage"
            label="Open-Graph-Bild"
            usageAlt={false}
            value={
              draft.ogImageId
                ? {
                    mediaAssetId: draft.ogImageId,
                    isDecorative: true,
                    altText: "",
                  }
                : null
            }
            onChange={(v) =>
              setDraft({
                ...draft,
                ogImageId: v?.mediaAssetId ?? null,
              })
            }
            hint="Optional. Wird für Social Shares verwendet."
          />
        </CmsSection>
      ) : null}

      <CmsSaveBar
        dirty={dirty}
        saving={saving}
        onSave={() => void save()}
        onPreview={
          previewPath
            ? () => window.open(previewPath, "_blank", "noopener,noreferrer")
            : undefined
        }
      />
    </div>
  );
}
