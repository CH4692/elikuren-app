import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MemberPageIntroProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/**
 * Compact light page header for the member area.
 * Title alone, optional description — no context badge.
 */
export function MemberPageIntro({
  title,
  description,
  actions,
  className,
}: MemberPageIntroProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#1f1f23] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-[#5c574e] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
