import { expect, test } from "@playwright/test";

const PATHS = ["/", "/auth/sign-in"] as const;

for (const path of PATHS) {
  test(`security headers present on ${path}`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status(), path).toBeLessThan(400);

    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(res.headers()["permissions-policy"]).toContain("camera=()");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });
}
