/** Stable JSON for dirty-state comparison (sorted object keys). */
export function normalizeCmsValue(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b),
    );
    const out: Record<string, unknown> = {};
    for (const [key, child] of entries) {
      out[key] = sortValue(child);
    }
    return out;
  }
  if (typeof value === "string") return value.trim();
  return value;
}

export function cmsValuesEqual(a: unknown, b: unknown): boolean {
  return normalizeCmsValue(a) === normalizeCmsValue(b);
}

export function newStableId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Normalize sortOrder to 0..n-1 after reorder. */
export function renumberSortOrder<T extends { sortOrder: number }>(
  items: T[],
): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }));
}
