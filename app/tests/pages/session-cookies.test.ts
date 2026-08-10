import { expect, test } from "@playwright/test";

import { loginAsMember, logout } from "../helpers/auth";

test.describe("session cookie security", () => {
  test("auth session cookie is HttpOnly after password login", async ({
    page,
  }) => {
    await loginAsMember(page);
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter((c) =>
      /session-token|authjs\.session-token|next-auth\.session-token/i.test(
        c.name,
      ),
    );

    expect(
      sessionCookies.length,
      `expected session cookie, got: ${cookies.map((c) => c.name).join(", ")}`,
    ).toBeGreaterThan(0);

    for (const cookie of sessionCookies) {
      expect(cookie.httpOnly, cookie.name).toBeTruthy();
      expect(["Lax", "Strict"]).toContain(cookie.sameSite);
      if (page.url().startsWith("https://")) {
        expect(cookie.secure, cookie.name).toBeTruthy();
      }
    }

    await logout(page);
  });
});
