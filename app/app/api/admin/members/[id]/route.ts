import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireActiveSession, requirePermission } from "@/lib/authz";
import type { Role } from "@/lib/generated/prisma/client";
import {
  getMemberById,
  ROLES,
  serializeMember,
  updateMemberProfile,
  updateMemberVoice,
} from "@/lib/members";
import { changeUserRole, setUserActiveState } from "@/lib/session-security";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireActiveSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const body = (await request.json()) as {
    role?: Role;
    voice?: string | null;
    is_active?: boolean;
    firstname?: string | null;
    lastname?: string | null;
    phone?: string | null;
    street?: string | null;
    house_number?: string | null;
    postal_code?: string | null;
    location?: string | null;
  };

  const member = await getMemberById(id);
  if (!member) {
    return NextResponse.json(
      { detail: "Mitglied nicht gefunden", code: "http_404" },
      { status: 404 },
    );
  }

  const wantsRole = "role" in body && body.role != null;
  const wantsVoice = "voice" in body;
  const wantsActive = "is_active" in body && body.is_active != null;
  const wantsProfile =
    "firstname" in body ||
    "lastname" in body ||
    "phone" in body ||
    "street" in body ||
    "house_number" in body ||
    "postal_code" in body ||
    "location" in body;

  if (!wantsRole && !wantsVoice && !wantsActive && !wantsProfile) {
    return NextResponse.json(
      { detail: "Keine Änderungen", code: "validation_error" },
      { status: 400 },
    );
  }

  if (wantsRole) {
    const gate = await requirePermission("ROLE_MANAGE");
    if (!gate.ok) return gate.response;
    if (!ROLES.includes(body.role!)) {
      return NextResponse.json(
        { detail: "Ungültige Rolle", code: "validation_error" },
        { status: 400 },
      );
    }
    if (body.role !== member.role) {
      await changeUserRole({
        userId: id,
        role: body.role!,
        actorUserId: gate.user.id,
      });
    }
  }

  if (wantsVoice) {
    const gate = await requirePermission("MEMBER_MANAGE");
    if (!gate.ok) return gate.response;
    const voice = body.voice?.trim() || null;
    if (voice !== member.voice) {
      await updateMemberVoice(id, voice);
      await writeAuditLog({
        action: "user.voice_changed",
        entityType: "user",
        entityId: id,
        actorUserId: gate.user.id,
        metadata: { voice, email: member.email },
      });
    }
  }

  if (wantsActive) {
    const gate = await requirePermission("MEMBER_MANAGE");
    if (!gate.ok) return gate.response;
    if (body.is_active !== member.isActive) {
      await setUserActiveState({
        userId: id,
        isActive: body.is_active!,
        actorUserId: gate.user.id,
      });
    }
  }

  if (wantsProfile) {
    const gate = await requirePermission("MEMBER_MANAGE");
    if (!gate.ok) return gate.response;
    await updateMemberProfile(id, {
      firstname: body.firstname,
      lastname: body.lastname,
      phone: body.phone,
      street: body.street,
      houseNumber: body.house_number,
      postalCode: body.postal_code,
      location: body.location,
    });
    await writeAuditLog({
      action: "user.profile_updated",
      entityType: "user",
      entityId: id,
      actorUserId: gate.user.id,
      metadata: { email: member.email },
    });
  }

  const updated = await getMemberById(id);
  return NextResponse.json(serializeMember(updated!));
}
