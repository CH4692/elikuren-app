-- Normalize casting: null / OTHER → Elikuren / Solo.
UPDATE "sheet_files" SET "voice_group" = 'ELIKUREN' WHERE "voice_group" IS NULL;
UPDATE "audio_files" SET "voice_group" = 'ELIKUREN' WHERE "voice_group" IS NULL;
UPDATE "concert_items" SET "ensemble" = 'ELIKUREN' WHERE "ensemble" IS NULL;

UPDATE "sheet_files" SET "voice_group" = 'SOLO' WHERE "voice_group" = 'OTHER';
UPDATE "audio_files" SET "voice_group" = 'SOLO' WHERE "voice_group" = 'OTHER';
UPDATE "concert_items" SET "ensemble" = 'SOLO' WHERE "ensemble" = 'OTHER';
