/** Format integer cents as EUR display string. */
export function formatCents(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Parse a decimal euro string like "12,50" or "12.50" to cents. */
export function parseEurosToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, frac = ""] = normalized.split(".");
  const sign = whole.startsWith("-") ? -1 : 1;
  const absWhole = whole.replace("-", "");
  const cents = Number(absWhole) * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isFinite(cents)) return null;
  return sign * cents;
}
