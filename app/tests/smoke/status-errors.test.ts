import { expect, test } from "@playwright/test";

test.describe("status and error smoke", () => {
  test("valid public route succeeds", async ({ request }) => {
    const res = await request.get("/home");
    expect(res.status()).toBeLessThan(400);
  });

  test("unknown route returns Next not-found (404)", async ({ request }) => {
    const res = await request.get("/this-route-should-not-exist-qe-smoke");
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body.toLowerCase()).not.toContain("prisma");
    expect(body.toLowerCase()).not.toContain("database_url");
    expect(body).not.toMatch(/AUTH_SECRET/i);
  });

  test("guest admin page is denied or redirected", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    // Middleware/auth should not leave an anonymous admin shell.
    await expect(page).toHaveURL(/auth\/sign-in|auth\/error/);
  });

  test("unauthorized API returns 401/403", async ({ request }) => {
    const res = await request.get("/api/admin/members");
    expect([401, 403]).toContain(res.status());
    const text = await res.text();
    expect(text.toLowerCase()).not.toContain("password");
    expect(text).not.toMatch(/AUTH_SECRET/i);
  });

  test("malformed contact payload returns 400", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { email: "not-an-email", name: "", message: "" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toEqual(expect.objectContaining({ error: expect.any(String) }));
    expect(JSON.stringify(body)).not.toMatch(/stack|prisma|AUTH_/i);
  });
});
