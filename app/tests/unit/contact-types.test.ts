import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
} from "../../lib/contact-types";

describe("contact types", () => {
  it("defines a label for every contact type", () => {
    for (const type of CONTACT_TYPES) {
      assert.ok(CONTACT_TYPE_LABELS[type]);
      assert.match(CONTACT_TYPE_LABELS[type], /\S/);
    }
  });
});
