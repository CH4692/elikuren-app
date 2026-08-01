-- Flatten library: promote title/composer onto sheet_files / audio_files, drop music_pieces.

ALTER TABLE "sheet_files" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "sheet_files" ADD COLUMN IF NOT EXISTS "composer" TEXT NOT NULL DEFAULT '';

UPDATE "sheet_files" AS sf
SET
  "title" = COALESCE(NULLIF(BTRIM(mp."title"), ''), NULLIF(BTRIM(stf."original_name"), ''), 'Ohne Titel'),
  "composer" = COALESCE(mp."composer", '')
FROM "music_pieces" AS mp, "stored_files" AS stf
WHERE sf."piece_id" = mp."id" AND stf."id" = sf."stored_file_id";

UPDATE "sheet_files"
SET "title" = COALESCE(NULLIF(BTRIM("title"), ''), 'Ohne Titel')
WHERE "title" IS NULL OR BTRIM("title") = '';

ALTER TABLE "sheet_files" ALTER COLUMN "title" SET NOT NULL;

ALTER TABLE "audio_files" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "audio_files" ADD COLUMN IF NOT EXISTS "composer" TEXT NOT NULL DEFAULT '';

UPDATE "audio_files" AS af
SET
  "title" = COALESCE(NULLIF(BTRIM(mp."title"), ''), NULLIF(BTRIM(stf."original_name"), ''), 'Ohne Titel'),
  "composer" = COALESCE(mp."composer", '')
FROM "music_pieces" AS mp, "stored_files" AS stf
WHERE af."piece_id" = mp."id" AND stf."id" = af."stored_file_id";

UPDATE "audio_files"
SET "title" = COALESCE(NULLIF(BTRIM("title"), ''), 'Ohne Titel')
WHERE "title" IS NULL OR BTRIM("title") = '';

ALTER TABLE "audio_files" ALTER COLUMN "title" SET NOT NULL;

ALTER TABLE "sheet_files" DROP CONSTRAINT IF EXISTS "sheet_files_piece_id_fkey";
ALTER TABLE "audio_files" DROP CONSTRAINT IF EXISTS "audio_files_piece_id_fkey";

DROP INDEX IF EXISTS "sheet_files_piece_id_idx";
DROP INDEX IF EXISTS "audio_files_piece_id_idx";

ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "piece_id";
ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "sheet_type";
ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "version";
ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "is_current";
ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "changelog";
ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "sort_order";

ALTER TABLE "audio_files" DROP COLUMN IF EXISTS "piece_id";
ALTER TABLE "audio_files" DROP COLUMN IF EXISTS "sort_order";

CREATE INDEX IF NOT EXISTS "sheet_files_title_idx" ON "sheet_files"("title");
CREATE INDEX IF NOT EXISTS "sheet_files_composer_idx" ON "sheet_files"("composer");
CREATE INDEX IF NOT EXISTS "audio_files_title_idx" ON "audio_files"("title");
CREATE INDEX IF NOT EXISTS "audio_files_composer_idx" ON "audio_files"("composer");
CREATE INDEX IF NOT EXISTS "audio_files_voice_group_idx" ON "audio_files"("voice_group");

DROP TABLE IF EXISTS "music_pieces";

DROP TYPE IF EXISTS "RehearsalStatus";
DROP TYPE IF EXISTS "SheetType";
