import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { postLoginPath } from "../../lib/post-login-path";

describe("postLoginPath", () => {
  it("sends admin-area roles to /admin", () => {
    for (const role of ["vorstand", "kassenwart", "kassenpruefer"] as const) {
      assert.equal(postLoginPath(role), "/admin");
    }
  });

  it("sends members to the dashboard fallback", () => {
    assert.equal(postLoginPath("mitglied"), "/dashboard");
    assert.equal(postLoginPath("mitglied", "/profile"), "/profile");
  });
});
