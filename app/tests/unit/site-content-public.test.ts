import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveMediaAlt } from "../../lib/public-media";
import {
  filterPublicNavigation,
  filterPublicSocial,
} from "../../lib/site-content/public-chrome";
import { isSectionEffectivelyVisible } from "../../lib/site-content/registry";
import { splitCmsParagraphs } from "../../lib/site-content/text";

describe("splitCmsParagraphs", () => {
  it("splits on blank lines", () => {
    assert.deepEqual(splitCmsParagraphs("Eins\n\nZwei\n\nDrei"), [
      "Eins",
      "Zwei",
      "Drei",
    ]);
  });

  it("trims and drops empty parts", () => {
    assert.deepEqual(splitCmsParagraphs("  A  \n\n\n  B  \n\n"), ["A", "B"]);
  });
});

describe("public media alt", () => {
  it("uses empty alt for decorative images", () => {
    assert.equal(
      resolveMediaAlt({ isDecorative: true, altText: "ignored", title: "x" }),
      "",
    );
  });

  it("prefers usage alt for content images", () => {
    assert.equal(
      resolveMediaAlt({
        isDecorative: false,
        altText: "Chor auf der Bühne",
        title: "Catalog",
      }),
      "Chor auf der Bühne",
    );
  });
});

describe("hidden sections / public chrome filters", () => {
  it("treats toggleable hidden as not visible", () => {
    assert.equal(isSectionEffectivelyVisible("toggleable", false), false);
    assert.equal(isSectionEffectivelyVisible("fixed", false), true);
  });

  it("filters navigation to visible items and children", () => {
    const filtered = filterPublicNavigation({
      items: [
        {
          id: "a",
          label: "Hidden",
          href: "/about",
          visible: false,
          sortOrder: 0,
        },
        {
          id: "b",
          label: "Parent",
          visible: true,
          sortOrder: 1,
          children: [
            {
              id: "b1",
              label: "Child hidden",
              href: "/history",
              visible: false,
              sortOrder: 0,
            },
            {
              id: "b2",
              label: "Child visible",
              href: "/proben",
              visible: true,
              sortOrder: 1,
            },
          ],
        },
      ],
    });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]!.id, "b");
    assert.equal(filtered[0]!.children?.length, 1);
    assert.equal(filtered[0]!.children?.[0]?.id, "b2");
  });

  it("filters social to visible https items order", () => {
    const filtered = filterPublicSocial({
      items: [
        {
          id: "s2",
          label: "Instagram",
          url: "https://instagram.com/x",
          visible: true,
          sortOrder: 2,
        },
        {
          id: "s1",
          label: "YouTube",
          url: "https://youtube.com/x",
          visible: true,
          sortOrder: 1,
        },
        {
          id: "s0",
          label: "Hidden",
          url: "https://example.com",
          visible: false,
          sortOrder: 0,
        },
      ],
    });
    assert.deepEqual(
      filtered.map((i) => i.id),
      ["s1", "s2"],
    );
  });
});
