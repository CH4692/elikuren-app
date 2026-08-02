import { test, expect } from "@playwright/test";

test("health endpoint is ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    status: "ok",
    service: "elikuren-web",
  });
});
