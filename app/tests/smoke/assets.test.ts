import { test, expect } from "@playwright/test";

import {
  CRITICAL_ASSETS,
  expectAssetsOk,
  expectAssetOk,
} from "../helpers/assets";

test("critical public assets return HTTP 200", async ({ request }) => {
  await expectAssetsOk(request, CRITICAL_ASSETS);
});

test("manifest icons exist", async ({ request }) => {
  const res = await request.get("/manifest.json");
  expect(res.status()).toBe(200);
  const manifest = (await res.json()) as {
    icons?: Array<{ src: string }>;
  };
  expect(manifest.icons?.length).toBeGreaterThan(0);
  for (const icon of manifest.icons ?? []) {
    await expectAssetOk(request, icon.src);
  }
});
