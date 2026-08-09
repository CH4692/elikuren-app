import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { databaseHost } from "../../lib/db-url";
import {
  assertPreviewWipeAllowed,
  assertProductionSeedAllowed,
} from "../../lib/env-guards";

describe("databaseHost", () => {
  it("parses neon hosts from postgres URLs", () => {
    assert.equal(
      databaseHost(
        "postgresql://user:pass@ep-preview.eu-central-1.aws.neon.tech/neondb?sslmode=require",
      ),
      "ep-preview.eu-central-1.aws.neon.tech",
    );
  });
});

describe("assertPreviewWipeAllowed", () => {
  it("allows CI preview when host pin matches", () => {
    const result = assertPreviewWipeAllowed({
      TARGET_ENV: "preview",
      CI: "true",
      PREVIEW_DATABASE_HOST: "ep-preview.eu-central-1.aws.neon.tech",
      DATABASE_URL:
        "postgresql://u:p@ep-preview.eu-central-1.aws.neon.tech/db?sslmode=require",
    });
    assert.equal(result.host, "ep-preview.eu-central-1.aws.neon.tech");
  });

  it("refuses production vercel env", () => {
    assert.throws(
      () =>
        assertPreviewWipeAllowed({
          TARGET_ENV: "preview",
          VERCEL_ENV: "production",
          CI: "true",
          DATABASE_URL:
            "postgresql://u:p@ep-preview.eu-central-1.aws.neon.tech/db",
        }),
      /VERCEL_ENV=production/,
    );
  });

  it("refuses production host pin", () => {
    assert.throws(
      () =>
        assertPreviewWipeAllowed({
          TARGET_ENV: "preview",
          CI: "true",
          PRODUCTION_DATABASE_HOST: "ep-prod.neon.tech",
          DATABASE_URL: "postgresql://u:p@ep-prod.neon.tech/db",
        }),
      /PRODUCTION_DATABASE_HOST/,
    );
  });
});

describe("assertProductionSeedAllowed", () => {
  it("allows production host pin", () => {
    const result = assertProductionSeedAllowed({
      TARGET_ENV: "production",
      PRODUCTION_DATABASE_HOST: "ep-prod.neon.tech",
      DATABASE_URL: "postgresql://u:p@ep-prod.neon.tech/db",
    });
    assert.equal(result.host, "ep-prod.neon.tech");
  });

  it("refuses preview host", () => {
    assert.throws(
      () =>
        assertProductionSeedAllowed({
          TARGET_ENV: "production",
          PREVIEW_DATABASE_HOST: "ep-preview.neon.tech",
          PRODUCTION_DATABASE_HOST: "ep-prod.neon.tech",
          DATABASE_URL: "postgresql://u:p@ep-preview.neon.tech/db",
        }),
      /PREVIEW_DATABASE_HOST/,
    );
  });
});
