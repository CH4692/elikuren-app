import { test, expect } from "@playwright/test";

test.describe("Health API integration", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.r2).toEqual(
      expect.objectContaining({
        api: expect.any(Boolean),
        bucket: expect.any(Boolean),
        publicBase: expect.any(Boolean),
      }),
    );
  });
});
