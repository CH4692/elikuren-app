/**
 * Safe coercion for CMS primitive form fields.
 * Never String(object) — that produced "[object Object]" in the editor.
 */

export function coerceCmsString(
  value: unknown,
  context?: string,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[cms] expected string scalar${context ? ` (${context})` : ""}, got ${
        Array.isArray(value) ? "array" : typeof value
      }`,
    );
  }
  return "";
}

/** Normalize a string[] field; object items (e.g. {text}) become "" with a warn. */
export function coerceCmsStringList(
  value: unknown,
  context?: string,
): string[] {
  if (!Array.isArray(value)) {
    if (value != null && process.env.NODE_ENV !== "production") {
      console.warn(
        `[cms] expected string[]${context ? ` (${context})` : ""}, got ${typeof value}`,
      );
    }
    return [];
  }
  return value.map((item, index) =>
    coerceCmsString(item, context ? `${context}[${index}]` : undefined),
  );
}
