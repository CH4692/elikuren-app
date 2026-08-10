import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SITE_PAGE_DEFS } from "../../lib/site-content/defaults";
import {
  GLOBAL_PAGE_KEY,
  PUBLIC_SITE_PAGE_KEYS,
  computePageLastUpdated,
  isPublicSitePageKey,
  isSectionEffectivelyVisible,
  resolveSectionVisibility,
} from "../../lib/site-content/registry";
import {
  assertStableListIdsPreserved,
  parseSectionData,
} from "../../lib/site-content/schemas";

describe("site content registry", () => {
  it("keeps global out of public page keys", () => {
    assert.equal(isPublicSitePageKey(GLOBAL_PAGE_KEY), false);
    for (const key of PUBLIC_SITE_PAGE_KEYS) {
      assert.equal(isPublicSitePageKey(key), true);
    }
  });

  it("treats fixed sections as always visible", () => {
    assert.equal(isSectionEffectivelyVisible("fixed", false), true);
    assert.equal(isSectionEffectivelyVisible("toggleable", false), false);
    assert.equal(resolveSectionVisibility("fixed", false), true);
    assert.equal(resolveSectionVisibility("toggleable", false), false);
  });

  it("computes lastUpdated from newest timestamp", () => {
    const page = new Date("2026-01-01T00:00:00.000Z");
    const older = new Date("2026-02-01T00:00:00.000Z");
    const newer = new Date("2026-03-01T00:00:00.000Z");
    const result = computePageLastUpdated({
      pageUpdatedAt: page,
      sectionUpdatedAts: [older, newer],
    });
    assert.equal(result.toISOString(), newer.toISOString());
  });
});

describe("site content schemas + defaults", () => {
  it("parses every seeded default", () => {
    for (const page of SITE_PAGE_DEFS) {
      for (const section of page.sections) {
        const parsed = parseSectionData(page.key, section.key, section.defaults);
        assert.equal(
          parsed.ok,
          true,
          `${page.key}/${section.key}: ${parsed.ok ? "" : parsed.error}`,
        );
      }
    }
  });

  it("requires usage alt text for non-decorative media refs", () => {
    const parsed = parseSectionData("home", "landing", {
      title: "T",
      tagline: "S",
      ctaLabel: "C",
      ctaHref: "/home",
      heroImage: {
        mediaAssetId: "media_1",
        isDecorative: false,
        altText: "",
      },
    });
    assert.equal(parsed.ok, false);
  });

  it("preserves stable list ids and rejects full replacement", () => {
    const prev = {
      items: [
        { id: "a", label: "A", href: "/about", visible: true, sortOrder: 0 },
        { id: "b", label: "B", href: "/contact", visible: true, sortOrder: 1 },
      ],
    };
    const nextKeep = {
      items: [
        { id: "b", label: "B2", href: "/contact", visible: true, sortOrder: 0 },
        { id: "a", label: "A2", href: "/about", visible: true, sortOrder: 1 },
      ],
    };
    assert.equal(
      assertStableListIdsPreserved(prev, nextKeep, "items").ok,
      true,
    );

    const nextReplace = {
      items: [
        { id: "x", label: "X", href: "/about", visible: true, sortOrder: 0 },
        { id: "y", label: "Y", href: "/contact", visible: true, sortOrder: 1 },
      ],
    };
    assert.equal(
      assertStableListIdsPreserved(prev, nextReplace, "items").ok,
      false,
    );
  });

  it("marks organization and footer as fixed", () => {
    const org = SITE_PAGE_DEFS.find((p) => p.key === "global")?.sections.find(
      (s) => s.key === "organization",
    );
    const footer = SITE_PAGE_DEFS.find((p) => p.key === "global")?.sections.find(
      (s) => s.key === "footer",
    );
    const social = SITE_PAGE_DEFS.find((p) => p.key === "global")?.sections.find(
      (s) => s.key === "social",
    );
    assert.equal(org?.visibilityMode, "fixed");
    assert.equal(footer?.visibilityMode, "fixed");
    assert.equal(social?.visibilityMode, "toggleable");
  });
});
