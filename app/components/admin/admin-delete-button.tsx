"use client";

import { Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminDeleteButtonProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size" | "children"
> & {
  /** Compact icon-only control for dense rows (still labeled for a11y). */
  iconOnly?: boolean;
  label?: string;
};

/**
 * Shared destructive action for admin tables/cards.
 * Always pair with ConfirmDialog before performing the delete.
 */
export function AdminDeleteButton({
  iconOnly = false,
  label = "Löschen",
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: AdminDeleteButtonProps) {
  const accessibleName = ariaLabel ?? label;

  if (iconOnly) {
    return (
      <Button
        type={type}
        size="icon-sm"
        variant="destructive"
        aria-label={accessibleName}
        title={accessibleName}
        className={cn(className)}
        {...props}
      >
        <Trash2 />
      </Button>
    );
  }

  return (
    <Button
      type={type}
      size="sm"
      variant="destructive"
      aria-label={accessibleName}
      className={cn("gap-1.5", className)}
      {...props}
    >
      <Trash2 />
      {label}
    </Button>
  );
}
