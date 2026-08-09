import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planFileDelivery } from "../../lib/file-delivery";

describe("planFileDelivery", () => {
  it("serves PUBLIC assets via durable CDN URL without R2 API credentials", () => {
    const plan = planFileDelivery({
      visibility: "PUBLIC",
      objectKey: "public/site/images/2026/08/img.jpeg",
      apiConfigured: false,
      publicUrl:
        "https://cdn.example/public/site/images/2026/08/img.jpeg",
    });
    assert.deepEqual(plan, {
      kind: "public",
      url: "https://cdn.example/public/site/images/2026/08/img.jpeg",
      expiresIn: null,
    });
  });

  it("requires R2 API credentials for MEMBERS/private media", () => {
    const plan = planFileDelivery({
      visibility: "MEMBERS",
      objectKey: "library/sheets/2026/08/file.pdf",
      apiConfigured: false,
      publicUrl: null,
    });
    assert.deepEqual(plan, {
      kind: "unavailable",
      code: "r2_unconfigured",
    });
  });

  it("plans signed delivery when API credentials are present", () => {
    const plan = planFileDelivery({
      visibility: "MEMBERS",
      objectKey: "library/audio/practice/2026/08/a.mp3",
      apiConfigured: true,
      publicUrl: null,
    });
    assert.deepEqual(plan, { kind: "signed" });
  });

  it("falls back to signed delivery for PUBLIC files without a durable URL", () => {
    const plan = planFileDelivery({
      visibility: "PUBLIC",
      objectKey: "public/site/images/2026/08/img.jpeg",
      apiConfigured: true,
      publicUrl: null,
    });
    assert.deepEqual(plan, { kind: "signed" });
  });

  it("marks PUBLIC files unavailable when CDN base and API are both missing", () => {
    const plan = planFileDelivery({
      visibility: "PUBLIC",
      objectKey: "public/site/images/2026/08/img.jpeg",
      apiConfigured: false,
      publicUrl: null,
    });
    assert.deepEqual(plan, {
      kind: "unavailable",
      code: "r2_unconfigured",
    });
  });
});
