-- Assign sheet music to a concert (same pattern as audio_files.concert_id).
ALTER TABLE "sheet_files" ADD COLUMN "concert_id" TEXT;

-- Backfill from the first linked program entry when available.
UPDATE "sheet_files" AS sf
SET "concert_id" = src."concert_id"
FROM (
  SELECT DISTINCT ON ("sheet_file_id")
    "sheet_file_id",
    "concert_id"
  FROM "concert_items"
  WHERE "sheet_file_id" IS NOT NULL
  ORDER BY "sheet_file_id", "sort_order" ASC, "id" ASC
) AS src
WHERE sf."id" = src."sheet_file_id"
  AND sf."concert_id" IS NULL;

-- Backfill audio from program links when still unassigned.
UPDATE "audio_files" AS af
SET "concert_id" = src."concert_id"
FROM (
  SELECT DISTINCT ON ("audio_file_id")
    "audio_file_id",
    "concert_id"
  FROM "concert_items"
  WHERE "audio_file_id" IS NOT NULL
  ORDER BY "audio_file_id", "sort_order" ASC, "id" ASC
) AS src
WHERE af."id" = src."audio_file_id"
  AND af."concert_id" IS NULL;

CREATE INDEX "sheet_files_concert_id_idx" ON "sheet_files"("concert_id");

ALTER TABLE "sheet_files"
  ADD CONSTRAINT "sheet_files_concert_id_fkey"
  FOREIGN KEY ("concert_id") REFERENCES "concerts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
