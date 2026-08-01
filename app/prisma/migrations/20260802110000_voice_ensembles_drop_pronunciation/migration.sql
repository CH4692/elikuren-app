-- Drop audio type Aussprache; add ensemble voice groups.

UPDATE "audio_files" SET "audio_type" = 'OTHER' WHERE "audio_type" = 'PRONUNCIATION';

CREATE TYPE "AudioType_new" AS ENUM (
  'FULL_RECORDING',
  'SOPRANO',
  'ALTO',
  'TENOR',
  'BASS',
  'PIANO',
  'REHEARSAL',
  'CONCERT_RECORDING',
  'OTHER'
);

ALTER TABLE "audio_files" ALTER COLUMN "audio_type" DROP DEFAULT;
ALTER TABLE "audio_files"
  ALTER COLUMN "audio_type" TYPE "AudioType_new"
  USING ("audio_type"::text::"AudioType_new");
ALTER TABLE "audio_files" ALTER COLUMN "audio_type" SET DEFAULT 'OTHER'::"AudioType_new";

DROP TYPE "AudioType";
ALTER TYPE "AudioType_new" RENAME TO "AudioType";

ALTER TYPE "VoiceGroup" ADD VALUE IF NOT EXISTS 'MUSICAL_TEAM';
ALTER TYPE "VoiceGroup" ADD VALUE IF NOT EXISTS 'EIGHT_TO_THE_BAR';
