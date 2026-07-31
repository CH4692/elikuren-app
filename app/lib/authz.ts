import "server-only";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@/lib/generated/prisma/client";
import {
  hasAdminAreaAccess,
  hasPermission,
  isAdminRole,
  normalizeEmail,
  type Permission,
} from "@/lib/permissions";

export type ActiveSessionUser = {
  id: string;
  email: string | null;
  role: Role;
  firstname: string | null;
  lastname: string | null;
  voice: string | null;
  isActive: boolean;
  sessionVersion: number;
};

/**
 * Loads the current session and re-validates isActive + sessionVersion from DB.
 * JWT alone is never trusted for authorization decisions.
 */
export async function requireActiveSession(): Promise<
  | { ok: true; user: ActiveSessionUser }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { detail: "Unauthorized", code: "http_401" },
        { status: 401 },
      ),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstname: true,
      lastname: true,
      voice: true,
      isActive: true,
      sessionVersion: true,
    },
  });

  const tokenVersion =
    typeof session.user.sessionVersion === "number"
      ? session.user.sessionVersion
      : 0;

  if (
    !dbUser ||
    !dbUser.isActive ||
    dbUser.sessionVersion !== tokenVersion
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { detail: "Unauthorized", code: "http_401" },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstname: dbUser.firstname,
      lastname: dbUser.lastname,
      voice: dbUser.voice,
      isActive: dbUser.isActive,
      sessionVersion: dbUser.sessionVersion,
    },
  };
}

export async function requirePermission(permission: Permission): Promise<
  | { ok: true; user: ActiveSessionUser }
  | { ok: false; response: NextResponse }
> {
  const session = await requireActiveSession();
  if (!session.ok) return session;

  if (!hasPermission(session.user.role, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        { detail: "Forbidden", code: "http_403" },
        { status: 403 },
      ),
    };
  }

  return session;
}

export async function requireAnyPermission(
  permissions: readonly Permission[],
): Promise<
  | { ok: true; user: ActiveSessionUser }
  | { ok: false; response: NextResponse }
> {
  const session = await requireActiveSession();
  if (!session.ok) return session;

  if (!permissions.some((p) => hasPermission(session.user.role, p))) {
    return {
      ok: false,
      response: NextResponse.json(
        { detail: "Forbidden", code: "http_403" },
        { status: 403 },
      ),
    };
  }

  return session;
}

export {
  hasAdminAreaAccess,
  hasPermission,
  isAdminRole,
  normalizeEmail,
};
