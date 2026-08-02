import { test, expect } from "@playwright/test";

const protectedRoutes = [
  "/profile",
  "/admin",
  "/admin/requests",
  "/dashboard",
] as const;

for (const path of protectedRoutes) {
  test(`${path} redirects guests to sign-in`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    const callbackUrl = new URL(page.url()).searchParams.get("callbackUrl");
    expect(callbackUrl).toBe(path);
  });
}

test("admin API is forbidden without session", async ({ request }) => {
  const res = await request.get("/api/admin/membership-requests");
  expect([401, 403]).toContain(res.status());
});
