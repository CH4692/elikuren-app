import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  isPublicObjectKey,
  publicObjectUrl,
  r2PublicBaseUrl,
} from "../../lib/public-media";

describe("public media URLs", () => {
  const previous = process.env.R2_PUBLIC_BASE_URL;

  afterEach(() => {
    if (previous === undefined) delete process.env.R2_PUBLIC_BASE_URL;
    else process.env.R2_PUBLIC_BASE_URL = previous;
  });

  it("detects the public/ object prefix", () => {
    assert.equal(isPublicObjectKey("public/site/a.jpg"), true);
    assert.equal(isPublicObjectKey("library/sheets/a.pdf"), false);
  });

  it("builds durable CDN URLs and strips trailing slashes on the base", () => {
    process.env.R2_PUBLIC_BASE_URL = "https://cdn.example/";
    assert.equal(r2PublicBaseUrl(), "https://cdn.example");
    assert.equal(
      publicObjectUrl("public/site/images/x.jpeg"),
      "https://cdn.example/public/site/images/x.jpeg",
    );
  });

  it("returns null for private keys or missing CDN base", () => {
    process.env.R2_PUBLIC_BASE_URL = "https://cdn.example";
    assert.equal(publicObjectUrl("library/audio/a.mp3"), null);
    delete process.env.R2_PUBLIC_BASE_URL;
    assert.equal(publicObjectUrl("public/site/images/x.jpeg"), null);
  });
});
