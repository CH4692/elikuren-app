"use client";

import { Plus, Trash2 } from "lucide-react";

import { CmsEmptyState } from "@/components/admin/cms/cms-empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { coerceCmsStringList } from "@/lib/site-content/cms-scalar";

/** Ordered list of plain strings (no stable ids in schema). */
export function CmsStringList({
  items,
  onChange,
  addLabel,
  emptyTitle,
  itemLabel,
}: {
  items: Array<string | null | undefined>;
  onChange: (next: string[]) => void;
  addLabel: string;
  emptyTitle: string;
  itemLabel: (index: number) => string;
}) {
  const safeItems = coerceCmsStringList(items, "CmsStringList");

  return (
    <div className="space-y-3">
      {safeItems.length === 0 ? (
        <CmsEmptyState
          title={emptyTitle}
          action={
            <Button type="button" size="sm" onClick={() => onChange([""])}>
              <Plus className="size-4" />
              {addLabel}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {safeItems.map((text, index) => (
            <li
              key={`paragraph-${index}`}
              className="rounded-xl border border-[#ebe4d8] bg-[#fbfaf7] p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#1f1f23]">
                  {itemLabel(index)}
                </p>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Absatz entfernen"
                  onClick={() =>
                    onChange(safeItems.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 />
                </Button>
              </div>
              <Textarea
                rows={3}
                value={text}
                onChange={(e) => {
                  const next = [...safeItems];
                  next[index] = e.target.value;
                  onChange(next);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      {safeItems.length > 0 ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-[#d9d2c4]"
          onClick={() => onChange([...safeItems, ""])}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}
