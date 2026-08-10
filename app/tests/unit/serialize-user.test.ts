import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { User } from "../../lib/generated/prisma/client";
import { serializeUser } from "../../lib/users-serialize";

function fakeUser(overrides: Partial<User> = {}): User {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "user_1",
    name: "Test User",
    firstname: "Test",
    lastname: "User",
    street: null,
    houseNumber: null,
    postalCode: null,
    location: null,
    phone: null,
    email: "test@example.com",
    emailVerified: null,
    image: null,
    birthday: null,
    createdAt: now,
    lastSignedIn: null,
    updatedAt: now,
    memberSince: null,
    role: "mitglied",
    voice: null,
    isActive: true,
    passwordHash: "SECRET_HASH_MUST_NOT_LEAK",
    sessionVersion: 3,
    ...overrides,
  } as User;
}

describe("serializeUser", () => {
  it("never exposes passwordHash or sessionVersion", () => {
    const payload = serializeUser(fakeUser());
    const json = JSON.stringify(payload);
    assert.equal(
      Object.prototype.hasOwnProperty.call(payload, "passwordHash"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(payload, "sessionVersion"),
      false,
    );
    assert.doesNotMatch(json, /SECRET_HASH|passwordHash|sessionVersion/);
    assert.equal(payload.email, "test@example.com");
    assert.equal(payload.role, "mitglied");
  });
});
