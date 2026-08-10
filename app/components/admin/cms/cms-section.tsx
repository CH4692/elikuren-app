import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CmsSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#d9d2c4] bg-white p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-lg font-semibold text-[#1f1f23]">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm text-[#5c574e]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
