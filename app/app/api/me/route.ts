import { NextResponse } from "next/server";

import { requireActiveSession } from "@/lib/authz";
import {
  deleteUser,
  getUserById,
  serializeUser,
  updateUser,
  type UserUpdateInput,
} from "@/lib/users";

export async function GET() {
  const gate = await requireActiveSession();
  if (!gate.ok) return gate.response;

  const user = await getUserById(gate.user.id);
  if (!user) {
    return NextResponse.json(
      { detail: "User not found", code: "http_404" },
      { status: 404 },
    );
  }

  return NextResponse.json(serializeUser(user));
}

export async function PATCH(request: Request) {
  const gate = await requireActiveSession();
  if (!gate.ok) return gate.response;

  const body = (await request.json()) as UserUpdateInput & {
    house_number?: string | null;
    postal_code?: string | null;
    member_since?: string | null;
  };

  // Role / isActive / sessionVersion never accepted from self-service PATCH.
  const updated = await updateUser(gate.user.id, {
    firstname: body.firstname,
    lastname: body.lastname,
    street: body.street,
    houseNumber: body.houseNumber ?? body.house_number,
    postalCode: body.postalCode ?? body.postal_code,
    location: body.location,
    phone: body.phone,
    email: body.email,
    birthday: body.birthday,
    memberSince: body.memberSince ?? body.member_since,
  });

  if (!updated) {
    return NextResponse.json(
      { detail: "User not found", code: "http_404" },
      { status: 404 },
    );
  }

  return NextResponse.json(serializeUser(updated));
}

export async function DELETE() {
  const gate = await requireActiveSession();
  if (!gate.ok) return gate.response;

  const deleted = await deleteUser(gate.user.id);
  if (!deleted) {
    return NextResponse.json(
      { detail: "User not found", code: "http_404" },
      { status: 404 },
    );
  }

  return NextResponse.json({ deleted: true });
}
