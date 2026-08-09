-- FileVisibility: PUBLIC for R2 prefix public/*
ALTER TYPE "FileVisibility" ADD VALUE IF NOT EXISTS 'PUBLIC';

-- gallery_images → media_assets (editorial flags; access stays on stored_files.visibility)
ALTER TABLE "gallery_images" RENAME TO "media_assets";

ALTER TABLE "media_assets" RENAME COLUMN "is_visible" TO "is_active";
ALTER TABLE "media_assets" ADD COLUMN "alt_text" TEXT NOT NULL DEFAULT '';
ALTER TABLE "media_assets" ADD COLUMN "is_decorative" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "media_assets" ADD COLUMN "is_archived" BOOLEAN NOT NULL DEFAULT false;

DROP INDEX IF EXISTS "gallery_images_title_idx";
DROP INDEX IF EXISTS "gallery_images_taken_at_idx";
DROP INDEX IF EXISTS "gallery_images_is_visible_idx";
DROP INDEX IF EXISTS "gallery_images_sort_order_idx";

CREATE INDEX "media_assets_title_idx" ON "media_assets"("title");
CREATE INDEX "media_assets_taken_at_idx" ON "media_assets"("taken_at");
CREATE INDEX "media_assets_is_active_idx" ON "media_assets"("is_active");
CREATE INDEX "media_assets_is_archived_idx" ON "media_assets"("is_archived");
CREATE INDEX "media_assets_sort_order_idx" ON "media_assets"("sort_order");

-- Concert marketing + datetime (no fake midnight for unknown times)
ALTER TABLE "concerts" ADD COLUMN "starts_at" TIMESTAMP(3);
ALTER TABLE "concerts" ADD COLUMN "ends_at" TIMESTAMP(3);
ALTER TABLE "concerts" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "concerts" ADD COLUMN "description" TEXT;
ALTER TABLE "concerts" ADD COLUMN "address" TEXT;
ALTER TABLE "concerts" ADD COLUMN "extra_info" TEXT;
ALTER TABLE "concerts" ADD COLUMN "ticket_url" TEXT;
ALTER TABLE "concerts" ADD COLUMN "show_on_website" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "concerts" ADD COLUMN "hero_image_id" TEXT;

-- Known time from previous homepage hardcode only (Europe/Berlin 17:00 on 2026-10-11)
UPDATE "concerts"
SET
  "starts_at" = TIMESTAMPTZ '2026-10-11 17:00:00+02',
  "description" = COALESCE("description", "notes")
WHERE "date" = DATE '2026-10-11'
  AND (
    "title" ILIKE '%Herbst%'
    OR "title" ILIKE '%Winterreise%'
    OR "slug" ILIKE '%schubert%'
    OR "slug" ILIKE '%herbst%'
  );

CREATE INDEX "concerts_starts_at_idx" ON "concerts"("starts_at");
CREATE INDEX "concerts_show_on_website_idx" ON "concerts"("show_on_website");

ALTER TABLE "concerts"
  ADD CONSTRAINT "concerts_hero_image_id_fkey"
  FOREIGN KEY ("hero_image_id") REFERENCES "media_assets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "stored_files_visibility_idx" ON "stored_files"("visibility");

-- Site CMS
CREATE TABLE "site_pages" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_pages_key_key" ON "site_pages"("key");

CREATE TABLE "site_sections" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_sections_page_id_key_key" ON "site_sections"("page_id", "key");
CREATE INDEX "site_sections_page_id_idx" ON "site_sections"("page_id");

ALTER TABLE "site_sections"
  ADD CONSTRAINT "site_sections_page_id_fkey"
  FOREIGN KEY ("page_id") REFERENCES "site_pages"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Timestamps on remaining app models (Auth.js tables unchanged)
ALTER TABLE "membership_requests"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "user_favorites"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
