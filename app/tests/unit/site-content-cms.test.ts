import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateSiteLink } from "../../lib/site-content/links";
import {
  cmsValuesEqual,
  newStableId,
  normalizeCmsValue,
  renumberSortOrder,
} from "../../lib/site-content/normalize";
import {
  assertStableListIdsPreserved,
  mediaRefSchema,
  parseSectionData,
} from "../../lib/site-content/schemas";
import {
  resolveSectionVisibility,
} from "../../lib/site-content/registry";

describe("CMS dirty normalization", () => {
  it("treats trimmed string whitespace as equal", () => {
    assert.equal(
      cmsValuesEqual({ title: "  Hello  " }, { title: "Hello" }),
      true,
    );
  });

  it("treats key order as irrelevant", () => {
    assert.equal(
      normalizeCmsValue({ a: 1, b: 2 }),
      normalizeCmsValue({ b: 2, a: 1 }),
    );
  });

  it("detects real changes", () => {
    assert.equal(
      cmsValuesEqual({ title: "A" }, { title: "B" }),
      false,
    );
  });
});

describe("mediaRef decorative alt rules", () => {
  it("allows empty alt when decorative", () => {
    const parsed = mediaRefSchema.safeParse({
      mediaAssetId: "asset_1",
      isDecorative: true,
      altText: "",
    });
    assert.equal(parsed.success, true);
  });

  it("requires alt when not decorative", () => {
    const parsed = mediaRefSchema.safeParse({
      mediaAssetId: "asset_1",
      isDecorative: false,
      altText: "",
    });
    assert.equal(parsed.success, false);
  });

  it("accepts meaningful alt when not decorative", () => {
    const parsed = mediaRefSchema.safeParse({
      mediaAssetId: "asset_1",
      isDecorative: false,
      altText: "Chor auf der Bühne",
    });
    assert.equal(parsed.success, true);
  });
});

describe("stable list ids + sortOrder", () => {
  it("keeps ids across reorder", () => {
    const a = { id: "a", sortOrder: 0 };
    const b = { id: "b", sortOrder: 1 };
    const reordered = renumberSortOrder([b, a]);
    assert.deepEqual(
      reordered.map((i) => i.id),
      ["b", "a"],
    );
    assert.deepEqual(
      reordered.map((i) => i.sortOrder),
      [0, 1],
    );
    const check = assertStableListIdsPreserved(
      { items: [a, b] },
      { items: reordered },
      "items",
    );
    assert.equal(check.ok, true);
  });

  it("rejects wholesale id replacement of same length", () => {
    const check = assertStableListIdsPreserved(
      { items: [{ id: "a" }, { id: "b" }] },
      { items: [{ id: "x" }, { id: "y" }] },
      "items",
    );
    assert.equal(check.ok, false);
  });

  it("creates unique stable ids", () => {
    const one = newStableId("nav");
    const two = newStableId("nav");
    assert.notEqual(one, two);
    assert.match(one, /^nav_/);
  });
});

describe("fixed visibility + social https", () => {
  it("cannot hide fixed sections via resolve", () => {
    assert.equal(resolveSectionVisibility("fixed", false), true);
  });

  it("rejects non-https social urls", () => {
    assert.equal(validateSiteLink("/home", { httpsOnly: true }).ok, false);
    assert.equal(
      validateSiteLink("https://example.com", { httpsOnly: true }).ok,
      true,
    );
  });

  it("surfaces nav link validation in schema", () => {
    const bad = parseSectionData("global", "navigation", {
      items: [
        {
          id: "n1",
          label: "Bad",
          href: "javascript:alert(1)",
          visible: true,
          sortOrder: 0,
        },
      ],
    });
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.match(bad.error, /unsicher|nicht erlaubt|Schema/i);

    const good = parseSectionData("global", "navigation", {
      items: [
        {
          id: "n1",
          label: "Home",
          href: "/home",
          visible: true,
          sortOrder: 0,
        },
      ],
    });
    assert.equal(good.ok, true);
  });
});
