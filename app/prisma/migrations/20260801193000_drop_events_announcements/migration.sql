-- Drop Termine (events) and Mitteilungen (announcements) features.
-- Keep user_content_events / ContentEventType (library analytics).

-- Child tables first (FK order)
DROP TABLE IF EXISTS "announcement_attachments";
DROP TABLE IF EXISTS "announcement_reads";
DROP TABLE IF EXISTS "announcement_targets";
DROP TABLE IF EXISTS "announcements";
DROP TABLE IF EXISTS "event_responses";
DROP TABLE IF EXISTS "events";

-- Enums used only by the dropped models
DROP TYPE IF EXISTS "AnnouncementAudience";
DROP TYPE IF EXISTS "RsvpStatus";
DROP TYPE IF EXISTS "EventType";

-- Loose invoice ↔ calendar-event link (no FK); calendar events are gone
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "event_id";

-- Remap leftover announcement uploads, then drop StoredFileCategory.ANNOUNCEMENT
UPDATE "stored_files" SET "category" = 'OTHER' WHERE "category" = 'ANNOUNCEMENT';

CREATE TYPE "StoredFileCategory_new" AS ENUM ('SHEET', 'AUDIO', 'INVOICE', 'OTHER');
ALTER TABLE "stored_files" ALTER COLUMN "category" TYPE "StoredFileCategory_new"
  USING ("category"::text::"StoredFileCategory_new");
DROP TYPE "StoredFileCategory";
ALTER TYPE "StoredFileCategory_new" RENAME TO "StoredFileCategory";
