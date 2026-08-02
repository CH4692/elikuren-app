-- ConcertWebsiteStatus replaces show_on_website
CREATE TYPE "ConcertWebsiteStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "concerts" ADD COLUMN "website_status" "ConcertWebsiteStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "concerts" ADD COLUMN "program_info" TEXT;
ALTER TABLE "concerts" ADD COLUMN "leader" TEXT;
ALTER TABLE "concerts" ADD COLUMN "admission_info" TEXT;
ALTER TABLE "concerts" ADD COLUMN "footer" TEXT;

-- PUBLISHED only when previously on website AND a real startsAt exists
UPDATE "concerts"
SET "website_status" = 'PUBLISHED'
WHERE "show_on_website" = true
  AND "starts_at" IS NOT NULL;

DROP INDEX IF EXISTS "concerts_show_on_website_idx";
ALTER TABLE "concerts" DROP COLUMN "show_on_website";

CREATE INDEX "concerts_website_status_starts_at_idx"
  ON "concerts"("website_status", "starts_at");
