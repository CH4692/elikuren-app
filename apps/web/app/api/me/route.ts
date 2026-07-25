import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  deleteUser,
  getOrCreateUserFromClerk,
  serializeUser,
  updateUser,
  type UserUpdateInput,
} from "@/lib/users";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { detail: "Unauthorized", code: "http_401" },
      { status: 401 },
    );
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json(
      { detail: "Unauthorized", code: "http_401" },
      { status: 401 },
    );
  }

  const user = await getOrCreateUserFromClerk({
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    primaryEmailAddress: clerkUser.primaryEmailAddress,
    primaryPhoneNumber: clerkUser.primaryPhoneNumber,
    createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : null,
  });

  return NextResponse.json(serializeUser(user));
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
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
    role: body.role,
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
  const { userId } = await auth();
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
