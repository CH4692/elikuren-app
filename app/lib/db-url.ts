/** Extract hostname from a Postgres connection string. */
export function databaseHost(connectionString: string): string {
  try {
    const normalized = connectionString.replace(/^postgresql:/i, "http:");
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return "";
  }
}
