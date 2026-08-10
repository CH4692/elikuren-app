import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CmsField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-[#1f1f23]">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-[#8a8478]">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-[#a94442]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
