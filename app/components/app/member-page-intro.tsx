import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MemberPageIntroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/** Compact hero matching the members dashboard visual language. */
export function MemberPageIntro({
  eyebrow = "Mitgliederbereich",
  title,
  description,
  actions,
  className,
}: MemberPageIntroProps) {
  return (
    <section
      className={cn(
        "relative mb-8 overflow-hidden rounded-3xl border border-[#d9d2c4] bg-[#1f1f23] px-6 py-6 text-[#f4f1eb] shadow-sm sm:px-8 sm:py-7",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,162,77,0.22),_transparent_55%)]"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-[#C8A24D]/40 bg-[#C8A24D]/15 px-3 py-1 text-xs font-medium tracking-wide text-[#E8D5A3]">
            {eyebrow}
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[#f4f1eb]/70 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
