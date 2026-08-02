-- Tag previously imported Mezzo practice tracks that were stored as OTHER
UPDATE "audio_files" AS a
SET "audio_type" = 'MEZZO'
FROM "stored_files" AS s
WHERE a."stored_file_id" = s."id"
  AND a."audio_type" = 'OTHER'
  AND s."original_name" ILIKE '%mezzo%';
