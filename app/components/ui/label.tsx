import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-medium text-[#2a2a2e]",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
