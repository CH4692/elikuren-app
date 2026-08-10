"use client";

import { ExternalLink, Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminSitePageView } from "@/lib/site-content";
import {
  getPublicSitePageDefinition,
  listGlobalSectionDefinitions,
} from "@/lib/site-content/defaults";
import { GLOBAL_PAGE_KEY } from "@/lib/site-content/registry";

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

export function WebsiteOverview() {
  const [pages, setPages] = useState<AdminSitePageView[]>([]);
  const [loading, setLoading] = useState(true);
  const globalSections = listGlobalSectionDefinitions();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/site");
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { pages: AdminSitePageView[] };
        setPages(data.pages);
      } catch {
        toast.error("Website-Inhalte konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const publicPages = pages.filter((p) => p.is_public_page);
  const globalPage = pages.find((p) => p.key === GLOBAL_PAGE_KEY);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Website"
        description="Öffentliche Inhalte und Seiten verwalten"
        actions={
          <Button asChild>
            <a href="/home" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Website öffnen
            </a>
          </Button>
        }
      />

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8478]">
          Seiten
        </h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : publicPages.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="Keine Seiten"
            description="Es sind noch keine öffentlichen CMS-Seiten vorhanden."
          />
        ) : (
          <ul className="divide-y divide-[#ebe4d8] overflow-hidden rounded-2xl border border-[#d9d2c4] bg-white">
            {publicPages.map((page) => {
              const def = getPublicSitePageDefinition(page.key);
              const title = def?.title ?? page.title;
              const description =
                page.description?.trim() ||
                def?.adminDescription ||
                "Keine Beschreibung";
              const previewPath = def?.publicPath ?? page.preview_path;
              return (
                <li
                  key={page.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-[#1f1f23]">{title}</p>
                    <p className="text-sm text-[#5c574e]">{description}</p>
                    <p className="text-xs text-[#8a8478]">
                      Zuletzt geändert: {formatUpdated(page.last_updated)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previewPath ? (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-[#d9d2c4]"
                      >
                        <a
                          href={previewPath}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Vorschau
                        </a>
                      </Button>
                    ) : null}
                    <Button asChild size="sm">
                      <Link href={`/admin/site/pages/${page.key}`}>
                        Bearbeiten
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8478]">
          Globale Inhalte
        </h2>
        <ul className="divide-y divide-[#ebe4d8] overflow-hidden rounded-2xl border border-[#d9d2c4] bg-white">
          {globalSections.map((row) => {
            const section = globalPage?.sections.find(
              (s) => s.key === row.key,
            );
            return (
              <li
                key={row.key}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-[#1f1f23]">{row.title}</p>
                  <p className="text-sm text-[#5c574e]">{row.adminDescription}</p>
                  <p className="text-xs text-[#8a8478]">
                    Zuletzt geändert:{" "}
                    {section
                      ? formatUpdated(section.updated_at)
                      : globalPage
                        ? formatUpdated(globalPage.last_updated)
                        : "—"}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/admin/site/global/${row.key}`}>Bearbeiten</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
