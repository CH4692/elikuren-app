import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pgSslForConnectionString } from "../../lib/pg-connection";

describe("pgSslForConnectionString", () => {
  it("disables SSL for localhost URLs", () => {
    assert.equal(
      pgSslForConnectionString(
        "postgresql://elikuren:elikuren@127.0.0.1:5432/elikuren",
      ),
      undefined,
    );
  });

  it("disables SSL when sslmode=disable is set", () => {
    assert.equal(
      pgSslForConnectionString(
        "postgresql://user:pass@neon.host/db?sslmode=disable",
      ),
      undefined,
    );
  });

  it("enables SSL for remote hosts", () => {
    assert.deepEqual(
      pgSslForConnectionString("postgresql://user:pass@neon.host/db"),
      { rejectUnauthorized: false },
    );
  });
});
