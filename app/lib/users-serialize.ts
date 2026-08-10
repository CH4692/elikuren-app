import type { User } from "@/lib/generated/prisma/client";

/** Public API shape for `/api/me` — never include secrets or session internals. */
export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    firstname: user.firstname,
    lastname: user.lastname,
    street: user.street,
    house_number: user.houseNumber,
    postal_code: user.postalCode,
    location: user.location,
    phone: user.phone,
    email: user.email,
    birthday: user.birthday?.toISOString().slice(0, 10) ?? null,
    created_at: user.createdAt.toISOString(),
    last_signed_in: user.lastSignedIn?.toISOString() ?? null,
    updated_at: user.updatedAt?.toISOString() ?? null,
    member_since: user.memberSince?.toISOString().slice(0, 10) ?? null,
    role: user.role,
    voice: user.voice,
    is_active: user.isActive,
  };
}
