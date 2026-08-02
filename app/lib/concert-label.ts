/** Display label for concert assignments, e.g. "Sommerkonzert 2025". */
export function formatConcertLabel(input: {
  title: string;
  year?: number | null;
  date?: string | Date | null;
}): string {
  const title = input.title.trim();
  let year = input.year ?? null;
  if (year == null && input.date) {
    if (typeof input.date === "string") {
      const parsed = Number(input.date.slice(0, 4));
      year = Number.isFinite(parsed) ? parsed : null;
    } else {
      year = input.date.getUTCFullYear();
    }
  }
  if (year != null && !/\b\d{4}\s*$/.test(title)) {
    return `${title} ${year}`;
  }
  return title;
}
