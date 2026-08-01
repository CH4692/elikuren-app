"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type FormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
};

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  onSubmit,
  submitLabel = "Speichern",
  loading,
}: FormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-[#d9d2c4] bg-[#f7f4ee] sm:max-w-lg"
      >
        <SheetHeader className="border-b border-[#ebe4d8] pb-4">
          <SheetTitle className="text-[#1f1f23]">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="text-[#5c574e]">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        <SheetFooter className="flex-row justify-end gap-2 border-t border-[#ebe4d8] bg-[#f7f4ee] sm:flex-row">
          {footer ?? (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              {onSubmit ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={loading}
                  onClick={onSubmit}
                >
                  {loading ? "Speichert…" : submitLabel}
                </Button>
              ) : null}
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
