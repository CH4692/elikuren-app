import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-[#cfc8bb] bg-[#f7f4ee] px-3 py-2 text-sm text-[#1f1f23] shadow-sm outline-none transition placeholder:text-[#1f1f23]/45 focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
