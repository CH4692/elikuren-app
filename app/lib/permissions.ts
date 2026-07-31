import type { Role } from "@/lib/generated/prisma/client";

export const PERMISSIONS = [
  "MEMBER_CONTENT_READ",
  "PROFILE_WRITE_SELF",
  "EVENT_READ",
  "EVENT_RESPOND",
  "ANNOUNCEMENT_READ",
  "PIECE_MANAGE",
  "MEMBER_MANAGE",
  "ACCESS_REQUEST_MANAGE",
  "EVENT_MANAGE",
  "ANNOUNCEMENT_MANAGE",
  "INVOICE_READ",
  "INVOICE_WRITE",
  "PAYMENT_RECORD",
  "ROLE_MANAGE",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  mitglied: [
    "MEMBER_CONTENT_READ",
    "PROFILE_WRITE_SELF",
    "EVENT_READ",
    "EVENT_RESPOND",
    "ANNOUNCEMENT_READ",
  ],
  vorstand: [
    "MEMBER_CONTENT_READ",
    "PROFILE_WRITE_SELF",
    "EVENT_READ",
    "EVENT_RESPOND",
    "ANNOUNCEMENT_READ",
    "PIECE_MANAGE",
    "MEMBER_MANAGE",
    "ACCESS_REQUEST_MANAGE",
    "EVENT_MANAGE",
    "ANNOUNCEMENT_MANAGE",
    "INVOICE_READ",
    "INVOICE_WRITE",
    "PAYMENT_RECORD",
    "ROLE_MANAGE",
  ],
  kassenwart: [
    "MEMBER_CONTENT_READ",
    "PROFILE_WRITE_SELF",
    "EVENT_READ",
    "EVENT_RESPOND",
    "ANNOUNCEMENT_READ",
    "INVOICE_READ",
    "INVOICE_WRITE",
    "PAYMENT_RECORD",
  ],
  kassenpruefer: [
    "MEMBER_CONTENT_READ",
    "PROFILE_WRITE_SELF",
    "EVENT_READ",
    "EVENT_RESPOND",
    "ANNOUNCEMENT_READ",
    "INVOICE_READ",
  ],
};

export function permissionsForRole(
  role: Role | string | null | undefined,
): readonly Permission[] {
  if (!role || !(role in ROLE_PERMISSIONS)) return [];
  return ROLE_PERMISSIONS[role as Role];
}

export function hasPermission(
  role: Role | string | null | undefined,
  permission: Permission,
): boolean {
  return permissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: Role | string | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/** True if role can access any /admin area (not just vorstand). */
export function hasAdminAreaAccess(
  role: Role | string | null | undefined,
): boolean {
  return hasAnyPermission(role, [
    "ACCESS_REQUEST_MANAGE",
    "MEMBER_MANAGE",
    "PIECE_MANAGE",
    "EVENT_MANAGE",
    "ANNOUNCEMENT_MANAGE",
    "INVOICE_READ",
  ]);
}

/** @deprecated Prefer hasPermission / ACCESS_REQUEST_MANAGE etc. */
export function isAdminRole(role: Role | string | null | undefined): boolean {
  return hasPermission(role, "ACCESS_REQUEST_MANAGE");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
