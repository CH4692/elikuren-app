import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getGlobalSectionDefinition,
  getPublicSitePageDefinition,
  isGlobalSectionKey,
  listGlobalSectionDefinitions,
  listPublicSitePageDefinitions,
} from "../../lib/site-content/defaults";
import {
  coerceCmsString,
  coerceCmsStringList,
} from "../../lib/site-content/cms-scalar";
import {
  GLOBAL_PAGE_KEY,
  isGlobalPageKey,
  isPublicSitePageKey,
  PUBLIC_SITE_PAGE_KEYS,
  publicPathForPageKey,
} from "../../lib/site-content/registry";

describe("cms scalar coercion", () => {
  it("keeps strings and empties null/undefined", () => {
    assert.equal(coerceCmsString("Hallo"), "Hallo");
    assert.equal(coerceCmsString(null), "");
    assert.equal(coerceCmsString(undefined), "");
  });

  it("never stringifies objects or arrays for inputs", () => {
    assert.equal(coerceCmsString({ mediaAssetId: "x" }), "");
    assert.equal(coerceCmsString([{ text: "a" }]), "");
    assert.equal(coerceCmsString({ label: "CTA", href: "/home" }), "");
    const result = coerceCmsString({ foo: 1 });
    assert.notEqual(result, "[object Object]");
    assert.equal(/object/i.test(result), false);
    assert.equal(/\{/.test(result), false);
  });

  it("normalizes string lists without object coercion", () => {
    assert.deepEqual(coerceCmsStringList(["a", "b"]), ["a", "b"]);
    assert.deepEqual(
      coerceCmsStringList([{ text: "oops" }, "ok"] as unknown[]),
      ["", "ok"],
    );
    for (const item of coerceCmsStringList([{ a: 1 }] as unknown[])) {
      assert.notEqual(item, "[object Object]");
      assert.equal(/object/i.test(item), false);
    }
  });
});

describe("public page registry metadata", () => {
  it("resolves every PUBLIC_SITE_PAGE_KEY", () => {
    for (const key of PUBLIC_SITE_PAGE_KEYS) {
      const def = getPublicSitePageDefinition(key);
      assert.ok(def, `missing definition for ${key}`);
      assert.ok(def.title.trim().length > 0, `${key} title`);
      assert.ok(def.adminDescription.trim().length > 0, `${key} description`);
      assert.equal(def.publicPath, publicPathForPageKey(key));
      assert.match(def.publicPath, /^\//);
    }
    assert.equal(
      listPublicSitePageDefinitions().length,
      PUBLIC_SITE_PAGE_KEYS.length,
    );
  });

  it("rejects unknown keys and treats global as config-only", () => {
    assert.equal(getPublicSitePageDefinition("not-a-page"), null);
    assert.equal(getPublicSitePageDefinition(GLOBAL_PAGE_KEY), null);
    assert.equal(isPublicSitePageKey(GLOBAL_PAGE_KEY), false);
    assert.equal(isGlobalPageKey(GLOBAL_PAGE_KEY), true);
  });
});

describe("global section registry metadata", () => {
  it("lists the four global sections", () => {
    const sections = listGlobalSectionDefinitions();
    assert.equal(sections.length, 4);
    for (const section of sections) {
      assert.ok(isGlobalSectionKey(section.key));
      assert.ok(section.title.trim());
      assert.ok(section.adminDescription.trim());
      assert.ok(getGlobalSectionDefinition(section.key));
    }
    assert.equal(getGlobalSectionDefinition("nope"), null);
  });
});
