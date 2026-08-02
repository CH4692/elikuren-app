import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MemberShellProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

/**
 * Light member portal canvas (separate from the dark marketing site).
 * Fixed public navbar still overlays the top — pt accounts for it.
 */
export function MemberShell({
  children,
  className,
  narrow,
}: MemberShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--admin-canvas,#f7f4ee)] text-[#1f1f23]">
      <main
        className={cn(
          "mx-auto px-4 pb-16 pt-28 sm:px-6",
          narrow ? "max-w-3xl" : "max-w-5xl",
          className,
        )}
      >
        <div className="animate-in fade-in-0 duration-300">{children}</div>
      </main>
    </div>
  );
}
