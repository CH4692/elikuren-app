/** Shared pg Pool SSL options for local and Neon URLs. */
export function pgSslForConnectionString(connectionString: string) {
  if (
    connectionString.includes("sslmode=disable") ||
    /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(connectionString)
  ) {
    return undefined;
  }
  return { rejectUnauthorized: false } as const;
}
