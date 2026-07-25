import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  deleteUser,
  getUserById,
  serializeUser,
  updateUser,
  type UserUpdateInput,
} from "@/lib/users";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { detail: "Unauthorized", code: "http_401" },
      { status: 401 },
    );
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json(
      { detail: "User not found", code: "http_404" },
      { status: 404 },
    );
  }

  return NextResponse.json(serializeUser(user));
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { detail: "Unauthorized", code: "http_401" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as UserUpdateInput & {
    house_number?: string | null;
    postal_code?: string | null;
    member_since?: string | null;
  };

  // Role changes are admin-only and never accepted from self-service PATCH.
  const updated = await updateUser(userId, {
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
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { detail: "Unauthorized", code: "http_401" },
      { status: 401 },
    );
  }

  const deleted = await deleteUser(userId);
  if (!deleted) {
    return NextResponse.json(
      { detail: "User not found", code: "http_404" },
      { status: 404 },
    );
  }

  return NextResponse.json({ deleted: true });
}
