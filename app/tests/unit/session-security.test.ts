import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  changeUserRoleData,
  sessionBumpData,
  setUserActiveData,
} from "../../lib/session-security-data";

describe("sessionBumpData", () => {
  it("increments sessionVersion so JWTs are invalidated", () => {
    assert.deepEqual(sessionBumpData(), {
      sessionVersion: { increment: 1 },
    });
  });
});

describe("setUserActiveData", () => {
  it("sets isActive and always bumps sessionVersion", () => {
    assert.deepEqual(setUserActiveData(false), {
      isActive: false,
      sessionVersion: { increment: 1 },
    });
    assert.deepEqual(setUserActiveData(true), {
      isActive: true,
      sessionVersion: { increment: 1 },
    });
  });
});

describe("changeUserRoleData", () => {
  it("sets role and always bumps sessionVersion", () => {
    assert.deepEqual(changeUserRoleData("mitglied"), {
      role: "mitglied",
      sessionVersion: { increment: 1 },
    });
    assert.deepEqual(changeUserRoleData("vorstand"), {
      role: "vorstand",
      sessionVersion: { increment: 1 },
    });
  });
});
