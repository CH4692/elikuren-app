"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { CmsEmptyState } from "@/components/admin/cms/cms-empty-state";
import { Button } from "@/components/ui/button";
import { renumberSortOrder } from "@/lib/site-content/normalize";

export function CmsListEditor<T extends { id: string; sortOrder: number }>({
  items,
  onChange,
  renderItem,
  createItem,
  addLabel,
  emptyTitle,
  emptyDescription,
  itemLabel,
  confirmRemove = false,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  createItem: () => T;
  addLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
  itemLabel: (item: T, index: number) => string;
  confirmRemove?: boolean;
}) {
  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const tmp = copy[index]!;
    copy[index] = copy[next]!;
    copy[next] = tmp;
    onChange(renumberSortOrder(copy));
  }

  function remove(index: number) {
    const item = items[index];
    if (!item) return;
    if (confirmRemove) {
      const ok = window.confirm(
        `„${itemLabel(item, index)}“ wirklich entfernen?`,
      );
      if (!ok) return;
    }
    onChange(renumberSortOrder(items.filter((_, i) => i !== index)));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <CmsEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => onChange(renumberSortOrder([createItem()]))}
            >
              <Plus className="size-4" />
              {addLabel}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#ebe4d8] bg-[#fbfaf7] p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#1f1f23]">
                  {itemLabel(item, index)}
                </p>
                <div className="inline-flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Nach oben"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Nach unten"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Entfernen"
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      )}
      {items.length > 0 ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-[#d9d2c4]"
          onClick={() =>
            onChange(renumberSortOrder([...items, createItem()]))
          }
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}
