import { hasAdminAreaAccess } from "@/lib/permissions";

/** Default landing path after sign-in, based on role. */
export function postLoginPath(
  role: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (hasAdminAreaAccess(role)) return "/admin";
  return fallback || "/dashboard";
}
