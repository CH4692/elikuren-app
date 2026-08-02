-- Gallery images for site/archive photos.

ALTER TYPE "StoredFileCategory" ADD VALUE IF NOT EXISTS 'IMAGE';

CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "taken_at" DATE,
    "stored_file_id" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gallery_images_title_idx" ON "gallery_images"("title");
CREATE INDEX "gallery_images_taken_at_idx" ON "gallery_images"("taken_at");
CREATE INDEX "gallery_images_is_visible_idx" ON "gallery_images"("is_visible");
CREATE INDEX "gallery_images_sort_order_idx" ON "gallery_images"("sort_order");

ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_stored_file_id_fkey" FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
