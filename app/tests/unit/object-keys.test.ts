import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  audioKindFromType,
  objectKeyFor,
  trashObjectKey,
} from "../../lib/object-keys";

describe("objectKeyFor", () => {
  const at = new Date("2026-08-02T12:00:00.000Z");

  it("builds library sheet keys with year/month", () => {
    const key = objectKeyFor({
      category: "SHEET",
      fileId: "file-1",
      extension: "pdf",
      at,
    });
    assert.equal(key, "library/sheets/2026/08/file-1.pdf");
  });

  it("builds practice and concert audio keys", () => {
    assert.equal(
      objectKeyFor({
        category: "AUDIO",
        fileId: "a1",
        extension: "mp3",
        audioKind: "practice",
        at,
      }),
      "library/audio/practice/2026/08/a1.mp3",
    );
    assert.equal(
      objectKeyFor({
        category: "AUDIO",
        fileId: "a2",
        extension: "mp3",
        audioKind: "concerts",
        concertId: "concert-9",
        at,
      }),
      "library/audio/concerts/concert-9/a2.mp3",
    );
  });

  it("builds finance invoice keys", () => {
    const key = objectKeyFor({
      category: "INVOICE",
      fileId: "inv-file",
      invoiceId: "invoice-1",
      extension: ".pdf",
      at,
    });
    assert.equal(key, "finance/invoices/2026/invoice-1/inv-file.pdf");
  });

  it("builds site image keys", () => {
    assert.equal(
      objectKeyFor({
        category: "IMAGE",
        fileId: "img-1",
        extension: "jpg",
        at,
      }),
      "site/images/2026/08/img-1.jpg",
    );
    assert.equal(
      objectKeyFor({
        category: "IMAGE",
        fileId: "img-2",
        extension: "jpg",
        publicWebsite: true,
        at,
      }),
      "public/site/images/2026/08/img-2.jpg",
    );
  });

  it("maps audio types to kinds", () => {
    assert.equal(audioKindFromType("REHEARSAL"), "practice");
    assert.equal(audioKindFromType("CONCERT_RECORDING"), "concerts");
    assert.equal(audioKindFromType("OTHER"), "other");
  });

  it("builds trash keys", () => {
    assert.equal(
      trashObjectKey({
        fileId: "gone",
        extension: "pdf",
        deletedAt: at,
      }),
      "trash/2026-08-02/gone.pdf",
    );
  });
});
