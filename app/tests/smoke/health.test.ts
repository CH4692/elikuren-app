import { test, expect } from "@playwright/test";

test("health endpoint is ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toMatchObject({
    status: "ok",
    service: "elikuren-web",
  });
  expect(body.r2).toEqual(
    expect.objectContaining({
      api: expect.any(Boolean),
      bucket: expect.any(Boolean),
      publicBase: expect.any(Boolean),
    }),
  );
});
