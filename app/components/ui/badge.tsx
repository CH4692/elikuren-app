import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary",
        /** Soft neutral chip — for draft / inactive / non-urgent states */
        secondary: "bg-[#8a8478]/15 text-[#5c574e]",
        muted: "bg-[#8a8478]/15 text-[#5c574e]",
        success: "bg-emerald-500/15 text-emerald-700",
        warning: "bg-amber-500/15 text-amber-800",
        danger: "bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
