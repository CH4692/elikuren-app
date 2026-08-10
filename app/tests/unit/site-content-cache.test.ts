import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  sitePageCacheKey,
  sitePageCacheTag,
} from "../../lib/site-content/cache";
import {
  CMS_STATIC_MEDIA,
  cmsStaticObjectKey,
} from "../../lib/site-content/cms-static-media";
import { GLOBAL_PAGE_KEY } from "../../lib/site-content/registry";

describe("site content cache keys/tags", () => {
  it("uses stable page keys and tags", () => {
    assert.equal(sitePageCacheTag("home"), "site-page:home");
    assert.equal(sitePageCacheTag(GLOBAL_PAGE_KEY), "site-page:global");
    assert.equal(sitePageCacheKey("home"), "site-content:page:home:v5");
    assert.equal(
      sitePageCacheKey(GLOBAL_PAGE_KEY),
      "site-content:page:global:v5",
    );
  });

  it("keeps page and global keys distinct", () => {
    assert.notEqual(sitePageCacheKey("home"), sitePageCacheKey(GLOBAL_PAGE_KEY));
    assert.notEqual(sitePageCacheTag("home"), sitePageCacheTag(GLOBAL_PAGE_KEY));
  });
});

describe("cms static media catalog", () => {
  it("has unique sourceKeys and object keys", () => {
    const keys = CMS_STATIC_MEDIA.map((d) => d.sourceKey);
    assert.equal(new Set(keys).size, keys.length);
    const objectKeys = CMS_STATIC_MEDIA.map((d) => cmsStaticObjectKey(d));
    assert.equal(new Set(objectKeys).size, objectKeys.length);
    for (const key of objectKeys) {
      assert.match(key, /^public\/cms-static\//);
    }
  });

  it("references existing /public files", async () => {
    const publicDir = path.join(process.cwd(), "public");
    for (const def of CMS_STATIC_MEDIA) {
      await fs.access(path.join(publicDir, def.publicFile));
    }
  });
});
