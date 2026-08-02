import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MemberPageIntroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/**
 * Compact light page header for the member area.
 * Typography on canvas — no dark hero card.
 */
export function MemberPageIntro({
  eyebrow = "Mitgliederbereich",
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
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#1f1f23] sm:text-3xl">
            {title}
          </h1>
          {eyebrow ? (
            <Badge
              variant="secondary"
              className="rounded-md border border-[#d9d2c4] bg-white px-2 py-0.5 text-xs font-medium text-[#5c574e]"
            >
              {eyebrow}
            </Badge>
          ) : null}
        </div>
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
