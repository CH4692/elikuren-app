import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  contentDispositionHeader,
  isR2ApiConfigured,
} from "../../lib/r2";

describe("isR2ApiConfigured", () => {
  const base = {
    R2_ACCESS_KEY_ID: "AKIAEXAMPLE",
    R2_SECRET_ACCESS_KEY: "secret",
    R2_BUCKET_NAME: "elikuren-music-prod",
    R2_ACCOUNT_ID: "account123",
  };

  it("is true when access key, secret, bucket, and account/endpoint exist", () => {
    assert.equal(isR2ApiConfigured(base), true);
    assert.equal(
      isR2ApiConfigured({
        ...base,
        R2_ACCOUNT_ID: "",
        R2_ENDPOINT: "https://account123.r2.cloudflarestorage.com",
      }),
      true,
    );
  });

  it("treats empty or whitespace-only strings as missing", () => {
    assert.equal(
      isR2ApiConfigured({
        ...base,
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
      }),
      false,
    );
    assert.equal(
      isR2ApiConfigured({
        ...base,
        R2_ACCESS_KEY_ID: "   ",
        R2_SECRET_ACCESS_KEY: "   ",
      }),
      false,
    );
  });

  it("requires bucket and endpoint or account id", () => {
    assert.equal(
      isR2ApiConfigured({
        ...base,
        R2_BUCKET_NAME: "",
      }),
      false,
    );
    assert.equal(
      isR2ApiConfigured({
        ...base,
        R2_ACCOUNT_ID: "",
        R2_ENDPOINT: "",
      }),
      false,
    );
  });
});

describe("contentDispositionHeader", () => {
  it("strips quotes and keeps an ascii filename fallback", () => {
    assert.equal(
      contentDispositionHeader("inline", 'score "final".pdf'),
      "inline; filename=\"score final.pdf\"; filename*=UTF-8''score%20final.pdf",
    );
  });

  it("adds RFC 5987 encoding for non-ascii names", () => {
    const header = contentDispositionHeader("attachment", "Übung-Alt.mp3");
    assert.match(header, /^attachment; filename="[^"]+"; filename\*=UTF-8''/);
    assert.match(header, /filename\*=UTF-8''.*%C3%9Cbung/);
  });
});
