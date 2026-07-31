"use client";

import { ScrollText } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AuditItem = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: unknown;
  created_at: string;
  actor: {
    id: string;
    email: string | null;
    firstname: string | null;
    lastname: string | null;
  } | null;
};

type AuditResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: AuditItem[];
};

function actorName(actor: AuditItem["actor"]) {
  if (!actor) return "System";
  const name = [actor.firstname, actor.lastname].filter(Boolean).join(" ");
  return name || actor.email || "Unbekannt";
}

export function AuditPanel() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      if (search.trim()) params.set("q", search.trim());
      if (actionFilter.trim()) params.set("action", actionFilter.trim());
      if (entityFilter.trim()) params.set("entityType", entityFilter.trim());

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (!res.ok) throw new Error("load failed");
      const json = (await res.json()) as AuditResponse;
      setData(json);
      setPage(json.page);
    } catch {
      toast.error("Audit-Log konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1);
  }, []);

  function applyFilters() {
    startTransition(() => {
      void load(1);
    });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <PageHeader
        title="Audit-Log"
        description="Nachvollziehbare Protokollierung administrativer Aktionen."
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Suche in Aktion, Entität, Akteur…"
        filters={
          <>
            <Input
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="Aktion"
              className="max-w-[160px] border-[#d9d2c4] bg-white"
            />
            <Input
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              placeholder="Entitätstyp"
              className="max-w-[160px] border-[#d9d2c4] bg-white"
            />
          </>
        }
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-[#d9d2c4]"
            onClick={applyFilters}
          >
            Filtern
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-[#ebe4d8] bg-white/70 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Keine Einträge"
          description="Es wurden keine Audit-Einträge für die aktuellen Filter gefunden."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Entität</TableHead>
                  <TableHead>Akteur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-[#5c574e]">
                      {new Date(item.created_at).toLocaleString("de-DE")}
                    </TableCell>
                    <TableCell className="font-medium">{item.action}</TableCell>
                    <TableCell>
                      <span className="text-[#5c574e]">{item.entity_type}</span>
                      <span className="block text-xs text-[#5c574e]">
                        {item.entity_id}
                      </span>
                    </TableCell>
                    <TableCell>{actorName(item.actor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#5c574e]">
              Seite {data.page} von {totalPages} · {data.total} Einträge
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-[#d9d2c4]"
                disabled={page <= 1 || loading}
                onClick={() => void load(page - 1)}
              >
                Zurück
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-[#d9d2c4]"
                disabled={page >= totalPages || loading}
                onClick={() => void load(page + 1)}
              >
                Weiter
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
