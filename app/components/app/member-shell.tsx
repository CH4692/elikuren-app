import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MemberShellProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

export function MemberShell({
  children,
  className,
  narrow,
}: MemberShellProps) {
  return (
    <main
      className={cn(
        "mx-auto min-h-screen px-4 pb-16 pt-28",
        narrow ? "max-w-3xl" : "max-w-4xl",
        className,
      )}
    >
      <div className="animate-in fade-in-0 duration-300">{children}</div>
    </main>
  );
}
