import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DataTableToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Suchen…",
  filters,
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-2xl border border-[#ebe4d8] bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {onSearchChange ? (
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="max-w-sm border-[#d9d2c4] bg-white"
          />
        ) : null}
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
