import { expect, test } from "@playwright/test";

/** Critical surfaces that must stay closed to anonymous callers on every PR. */
const guestDenied = [
  "/api/me",
  "/api/library/scores",
  "/api/admin/members",
  "/api/admin/invoices",
  "/api/admin/files/presign",
  "/api/admin/site",
] as const;

test.describe("security authz smoke", () => {
  for (const path of guestDenied) {
    test(`guest denied for ${path}`, async ({ request }) => {
      const res = await request.get(path);
      expect([401, 403, 405]).toContain(res.status());
    });
  }
});
