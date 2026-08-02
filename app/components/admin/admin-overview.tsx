import {
  ArrowUpRight,
  FileMusic,
  FileText,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { PageHeader } from "@/components/app/page-header";
import { hasPermission, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export type AdminKpi = {
  href: string;
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  /** Highlight when value > 0 needs attention */
  attention?: boolean;
};

type AdminOverviewProps = {
  role: string;
  kpis: AdminKpi[];
};

export function AdminOverview({ role, kpis }: AdminOverviewProps) {
  const areas = ADMIN_NAV_ITEMS.filter(
    (item) =>
      item.href !== "/admin" &&
      (item.permission === null ||
        hasPermission(role, item.permission as Permission)),
  );

  const attentionKpis = kpis.filter((kpi) => kpi.attention && kpi.value > 0);
  const calmKpis = kpis.filter((kpi) => !(kpi.attention && kpi.value > 0));

  return (
    <div className="space-y-10">
      <PageHeader
        title="Übersicht"
        description="Kennzahlen und direkter Einstieg in die Verwaltungsbereiche."
      />

      {kpis.length === 0 ? (
        <p className="text-sm text-[#5c574e]">
          Für deine Rolle sind keine Admin-Kennzahlen verfügbar.
        </p>
      ) : (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8478]">
              Kennzahlen
            </h2>
            {attentionKpis.length > 0 ? (
              <p className="text-xs text-[#a94442]">
                {attentionKpis.length}{" "}
                {attentionKpis.length === 1 ? "Punkt" : "Punkte"} brauchen
                Aufmerksamkeit
              </p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...attentionKpis, ...calmKpis].map((kpi) => (
              <KpiTile key={kpi.href + kpi.title} kpi={kpi} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8478]">
          Bereiche
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.href}
                href={area.href}
                className="group flex items-center gap-3 rounded-2xl border border-transparent bg-white/70 px-3.5 py-3 transition hover:border-[#C8A24D]/35 hover:bg-white"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1f1f23] text-[#C8A24D] transition group-hover:bg-[#1e3a2f]">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#1f1f23]">
                    {area.label}
                  </span>
                  <span className="block text-xs text-[#8a8478]">Öffnen</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-[#c4bbaa] transition group-hover:text-[#C8A24D]" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function KpiTile({ kpi }: { kpi: AdminKpi }) {
  const Icon = kpi.icon;
  const needsAttention = Boolean(kpi.attention && kpi.value > 0);

  return (
    <Link
      href={kpi.href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 transition",
        needsAttention
          ? "border-[#e2b4b2] shadow-[0_1px_0_rgba(169,68,66,0.08)] hover:border-[#a94442]/45"
          : "border-[#ebe4d8] hover:border-[#C8A24D]/45 hover:shadow-[0_8px_24px_-18px_rgba(31,31,35,0.45)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            needsAttention
              ? "bg-[#a94442]/10 text-[#a94442]"
              : "bg-[#C8A24D]/12 text-[#C8A24D]",
          )}
        >
          <Icon className="size-4" />
        </div>
        <ArrowUpRight
          className={cn(
            "size-4 transition",
            needsAttention
              ? "text-[#c98987] group-hover:text-[#a94442]"
              : "text-[#c4bbaa] group-hover:text-[#C8A24D]",
          )}
        />
      </div>

      <div className="mt-6 space-y-1">
        <p className="text-sm font-medium text-[#5c574e]">{kpi.title}</p>
        <p
          className={cn(
            "text-3xl font-semibold tracking-tight tabular-nums",
            needsAttention ? "text-[#a94442]" : "text-[#1f1f23]",
          )}
        >
          {kpi.value}
        </p>
        <p className="text-xs leading-5 text-[#8a8478]">{kpi.description}</p>
      </div>
    </Link>
  );
}

export const ADMIN_KPI_ICONS = {
  requests: UserPlus,
  library: FileMusic,
  invoices: FileText,
} as const;
