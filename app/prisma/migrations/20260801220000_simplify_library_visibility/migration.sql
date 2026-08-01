-- Simplify library visibility: drop publication workflow, add is_visible.

-- Sheet / audio: replace published_at with is_visible (default visible)
ALTER TABLE "sheet_files" ADD COLUMN IF NOT EXISTS "is_visible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "audio_files" ADD COLUMN IF NOT EXISTS "is_visible" BOOLEAN NOT NULL DEFAULT true;

UPDATE "sheet_files" SET "is_visible" = true;
UPDATE "audio_files" SET "is_visible" = true;

ALTER TABLE "sheet_files" DROP COLUMN IF EXISTS "published_at";
ALTER TABLE "audio_files" DROP COLUMN IF EXISTS "published_at";

CREATE INDEX IF NOT EXISTS "sheet_files_is_visible_idx" ON "sheet_files"("is_visible");
CREATE INDEX IF NOT EXISTS "audio_files_is_visible_idx" ON "audio_files"("is_visible");

-- Piece: drop publication fields
DROP INDEX IF EXISTS "music_pieces_publication_status_idx";
ALTER TABLE "music_pieces" DROP COLUMN IF EXISTS "publication_status";
ALTER TABLE "music_pieces" DROP COLUMN IF EXISTS "published_at";

-- Composer may be empty for simple uploads
ALTER TABLE "music_pieces" ALTER COLUMN "composer" SET DEFAULT '';

DROP TYPE IF EXISTS "PublicationStatus";
