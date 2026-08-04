import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { absoluteUrl, getSiteUrl, isProductionEnv } from "../../lib/site-url";

const ORIGINAL = {
  SITE_URL: process.env.SITE_URL,
  AUTH_URL: process.env.AUTH_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

afterEach(() => {
  for (const [key, value] of Object.entries(ORIGINAL)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("getSiteUrl", () => {
  it("prefers SITE_URL over AUTH_URL and normalizes trailing slash", () => {
    process.env.SITE_URL = "https://example.com/";
    process.env.AUTH_URL = "https://auth.example.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://public.example.com";
    delete process.env.VERCEL_ENV;
    assert.equal(getSiteUrl(), "https://example.com");
  });

  it("falls back to AUTH_URL before NEXT_PUBLIC_SITE_URL", () => {
    delete process.env.SITE_URL;
    process.env.AUTH_URL = "https://preview.example.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://public.example.com";
    assert.equal(getSiteUrl(), "https://preview.example.com");
  });

  it("falls back to NEXT_PUBLIC_SITE_URL", () => {
    delete process.env.SITE_URL;
    delete process.env.AUTH_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://elikuren-app.vercel.app/";
    process.env.VERCEL_ENV = "production";
    assert.equal(getSiteUrl(), "https://elikuren-app.vercel.app");
  });

  it("uses localhost fallback outside production", () => {
    delete process.env.SITE_URL;
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "preview";
    assert.equal(isProductionEnv(), false);
    assert.equal(getSiteUrl(), "http://localhost:3000");
  });

  it("fails in production without valid configuration", () => {
    delete process.env.SITE_URL;
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "production";
    assert.throws(() => getSiteUrl(), /Missing site URL configuration/);
  });

  it("rejects non-http(s) URLs", () => {
    process.env.SITE_URL = "ftp://example.com";
    assert.throws(() => getSiteUrl(), /protocol/);
  });
});

describe("absoluteUrl", () => {
  it("joins paths without duplicate slashes", () => {
    process.env.SITE_URL = "https://example.com/";
    assert.equal(absoluteUrl("/auth/sign-in"), "https://example.com/auth/sign-in");
    assert.equal(absoluteUrl("auth/sign-in"), "https://example.com/auth/sign-in");
    assert.equal(absoluteUrl("//email/logo.png"), "https://example.com/email/logo.png");
    assert.equal(absoluteUrl("/"), "https://example.com");
  });
});
