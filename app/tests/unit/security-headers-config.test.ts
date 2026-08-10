import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const configPath = path.join(process.cwd(), "next.config.mjs");

describe("next.config security headers", () => {
  const source = readFileSync(configPath, "utf8");

  it("disables the X-Powered-By header", () => {
    assert.match(source, /poweredByHeader:\s*false/);
  });

  it("declares baseline security response headers", () => {
    for (const header of [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]) {
      assert.match(
        source,
        new RegExp(header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `expected next.config.mjs to set ${header}`,
      );
    }
  });

  it("uses DENY framing and nosniff content type", () => {
    assert.match(source, /X-Frame-Options[\s\S]*DENY/);
    assert.match(source, /X-Content-Type-Options[\s\S]*nosniff/);
  });
});
