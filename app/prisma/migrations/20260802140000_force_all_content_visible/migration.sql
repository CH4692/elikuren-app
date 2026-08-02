-- All library/gallery/concert content is always visible to members.
UPDATE "sheet_files" SET "is_visible" = true WHERE "is_visible" = false;
UPDATE "audio_files" SET "is_visible" = true WHERE "is_visible" = false;
UPDATE "gallery_images" SET "is_visible" = true WHERE "is_visible" = false;
UPDATE "concerts" SET "is_visible" = true WHERE "is_visible" = false;
