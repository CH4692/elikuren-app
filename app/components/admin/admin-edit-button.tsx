"use client";

import { Pencil } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminEditButtonProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size" | "children"
> & {
  /**
   * Compact icon-only control for dense action columns (default).
   * Set false only when a visible text label is required.
   */
  iconOnly?: boolean;
  label?: string;
};

/**
 * Shared edit action for admin tables/cards.
 * Icon-only by default (admin table best practice); always provide an accessible name.
 */
export function AdminEditButton({
  iconOnly = true,
  label = "Bearbeiten",
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: AdminEditButtonProps) {
  const accessibleName = ariaLabel ?? label;

  if (iconOnly) {
    return (
      <Button
        type={type}
        size="icon-sm"
        variant="ghost"
        aria-label={accessibleName}
        title={accessibleName}
        className={cn(className)}
        {...props}
      >
        <Pencil />
      </Button>
    );
  }

  return (
    <Button
      type={type}
      size="sm"
      variant="outline"
      aria-label={accessibleName}
      className={cn("gap-1.5", className)}
      {...props}
    >
      <Pencil />
      {label}
    </Button>
  );
}
